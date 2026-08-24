package com.passportsahayak.kb.ai;

import com.passportsahayak.kb.dto.ChatRequest;
import com.passportsahayak.kb.dto.ChatResponse;
import com.passportsahayak.kb.dto.Citation;
import com.passportsahayak.kb.entity.ChatInteractionLog;
import com.passportsahayak.kb.repository.ChatInteractionLogRepository;
import com.passportsahayak.kb.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * Orchestrates the full RAG pipeline per SRS Sec 2.1:
 * Query -&gt; PII Redaction -&gt; Query Transformation -&gt; Vector Retrieval (threshold &gt;= 0.7)
 * -&gt; Prompt Augmentation with Citations -&gt; Azure OpenAI (gpt-4+) -&gt; Grounded Response with Citation.
 *
 * allowEmptyContext is always false: if retrieval finds nothing above the threshold, the
 * standard "No matching policy found" response is returned WITHOUT ever calling the LLM
 * (SRS Sec 4.1.1 / 4.1.3) - this is what prevents hallucinated, policy-deviant answers.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagChatService {

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are PassportSahayak AI, an assistant for India's Passport Seva Programme.

            STRICT RULES - follow all of them:
            1. Answer ONLY using the KNOWLEDGE BASE CONTEXT below. Never use outside knowledge, and
               never guess or fill gaps with assumptions not stated in the context.
            2. You do not grant, deny, or guarantee any passport outcome, and you never override or
               predict a police verification finding. All answers are informational/procedural
               guidance only, never a binding decision.
            3. If the question is ambiguous, sensitive, dispute-related (e.g. disputed parentage),
               fraud/bribery-related, or concerns a pending criminal/court case, set escalated=true
               and tell the user to contact their nearest PSK/RPO official or use the grievance
               channel - do not speculate on how it will be resolved.
            4. If the KNOWLEDGE BASE CONTEXT does not actually answer the question, set escalated=true
               and say so plainly rather than inventing an answer.
            5. You may call the available tools for live, per-applicant data (application status,
               appointment slot availability, center lookup) - never invent such data yourself, and
               never ask the user to type their ARN/Aadhaar/passport number into the chat.
            6. Cite the KB document code (e.g. KB-PASS-001) inline in your answer where relevant.
            7. Respond with ONLY a single JSON object, no markdown, no extra text, matching exactly:
               {"answer": "<your answer text>", "escalated": <true|false>}

            KNOWLEDGE BASE CONTEXT:
            %s
            """;

    private static final String STREAM_SYSTEM_PROMPT_TEMPLATE = """
            You are PassportSahayak AI, an assistant for India's Passport Seva Programme.

            STRICT RULES - follow all of them:
            1. Answer ONLY using the KNOWLEDGE BASE CONTEXT below. Never use outside knowledge, and
               never guess or fill gaps with assumptions not stated in the context.
            2. You do not grant, deny, or guarantee any passport outcome, and you never override or
               predict a police verification finding. All answers are informational/procedural
               guidance only, never a binding decision.
            3. If the question is ambiguous, sensitive, dispute-related, fraud/bribery-related, or
               concerns a pending criminal/court case, clearly tell the user to contact their nearest
               PSK/RPO official or use the grievance channel instead of speculating.
            4. If the KNOWLEDGE BASE CONTEXT does not answer the question, say so plainly rather than
               inventing an answer.
            5. Cite the KB document code (e.g. KB-PASS-001) inline in your answer where relevant.
            6. Respond in plain natural language (not JSON) - this is a live streaming response.

            KNOWLEDGE BASE CONTEXT:
            %s
            """;

    /**
     * Used when KB retrieval finds nothing BUT the request carries a structured ARN (see
     * AiRequestContext) - e.g. "what's my status?" is a live-data question, not a policy
     * question, so it will never match KB text and must not be refused outright. This
     * prompt has no KB context to ground on and relies entirely on the status tool.
     */
    private static final String TOOL_ONLY_SYSTEM_PROMPT = """
            You are PassportSahayak AI. No Knowledge Base policy text matched this query, but
            the applicant has an application in context for this session. If the question is
            about the status/progress of their own application, call the application status
            tool and answer from its result. If the question is NOT about their application
            status and isn't something a tool can answer, say plainly that no matching policy
            was found and set escalated=true. Never invent information.
            Respond with ONLY a single JSON object, no markdown, no extra text:
            {"answer": "<answer>", "escalated": <true|false>}
            """;

    private static final List<String> ESCALATION_MARKERS = List.of(
            "contact your nearest psk", "contact your rpo", "escalat", "grievance channel",
            "no matching policy", "cannot determine", "consult a legal professional", "pending court");

    private final PiiRedactionService piiRedactionService;
    private final QueryTransformationService queryTransformationService;
    private final VectorRetrievalService vectorRetrievalService;
    private final ChatClient chatClient;
    private final ChatInteractionLogRepository logRepository;

    public ChatResponse chat(AuthenticatedUser principal, ChatRequest request, String authorizationHeader) {
        String sessionId = (request.sessionId() != null && !request.sessionId().isBlank())
                ? request.sessionId() : UUID.randomUUID().toString();

        String redactedQuery = piiRedactionService.redact(request.query());
        String transformedQuery = queryTransformationService.transform(redactedQuery);

        List<RetrievedChunk> retrieved = vectorRetrievalService.retrieve(transformedQuery);

        boolean hasArnContext = request.arn() != null && !request.arn().isBlank();
        if (retrieved.isEmpty() && !hasArnContext) {
            // Pure policy question with no KB match: refuse outright (allowEmptyContext=false).
            ChatResponse response = ChatResponse.noMatch(sessionId);
            persistLog(sessionId, principal, redactedQuery, retrieved, response, List.of());
            return response;
        }

        String systemPrompt;
        if (retrieved.isEmpty()) {
            // No policy match, but an ARN is in context - let the model try the status tool
            // instead of refusing outright (see TOOL_ONLY_SYSTEM_PROMPT doc comment).
            systemPrompt = TOOL_ONLY_SYSTEM_PROMPT;
        } else {
            String context = retrieved.stream()
                    .map(rc -> "[" + rc.docCode() + " / " + rc.docTitle() + " / chunk " + rc.chunkIndex() + "]\n" + rc.content())
                    .collect(Collectors.joining("\n\n---\n\n"));
            systemPrompt = SYSTEM_PROMPT_TEMPLATE.formatted(context);
        }

        AiRequestContext.bind(request.arn(), authorizationHeader);
        try {
            ChatModelOutput output = chatClient.prompt()
                    .system(systemPrompt)
                    .user(transformedQuery)
                    .call()
                    .entity(ChatModelOutput.class);

            List<Citation> citations = retrieved.stream()
                    .map(rc -> new Citation(rc.docCode(), rc.docTitle(), rc.chunkIndex(),
                            Math.round(rc.similarity() * 1000.0) / 1000.0))
                    .toList();

            ChatResponse response = new ChatResponse(sessionId, output.answer(), output.escalated(), citations);
            persistLog(sessionId, principal, redactedQuery, retrieved, response, AiRequestContext.current().toolsInvoked());
            return response;
        } catch (Exception e) {
            log.error("RAG chat call to Azure OpenAI failed (check AZURE_OPENAI_* credentials)", e);
            ChatResponse response = new ChatResponse(sessionId,
                    "PassportSahayak AI is temporarily unavailable. Please contact your nearest PSK/RPO or try again shortly.",
                    true, List.of());
            persistLog(sessionId, principal, redactedQuery, retrieved, response, List.of());
            return response;
        } finally {
            AiRequestContext.clear();
        }
    }

    /**
     * Streaming variant for /ai/passport/chat/async. Tool-calling is intentionally NOT
     * enabled here: AiRequestContext is a ThreadLocal and Project Reactor's streaming
     * execution hops threads, so it would not reliably reach a tool method invoked mid-
     * stream. The streaming endpoint is KB-grounded Q&amp;A only; use /chat/sync for
     * requests that need live per-applicant data (status/slots).
     */
    public ChatStreamHandle prepareStream(AuthenticatedUser principal, ChatRequest request) {
        String sessionId = (request.sessionId() != null && !request.sessionId().isBlank())
                ? request.sessionId() : UUID.randomUUID().toString();

        String redactedQuery = piiRedactionService.redact(request.query());
        String transformedQuery = queryTransformationService.transform(redactedQuery);

        List<RetrievedChunk> retrieved = vectorRetrievalService.retrieve(transformedQuery);

        if (retrieved.isEmpty()) {
            ChatResponse response = ChatResponse.noMatch(sessionId);
            persistLog(sessionId, principal, redactedQuery, retrieved, response, List.of());
            return new ChatStreamHandle(sessionId, List.of(), Flux.just(response.answer()));
        }

        String context = retrieved.stream()
                .map(rc -> "[" + rc.docCode() + " / " + rc.docTitle() + " / chunk " + rc.chunkIndex() + "]\n" + rc.content())
                .collect(Collectors.joining("\n\n---\n\n"));
        String systemPrompt = STREAM_SYSTEM_PROMPT_TEMPLATE.formatted(context);

        List<Citation> citations = retrieved.stream()
                .map(rc -> new Citation(rc.docCode(), rc.docTitle(), rc.chunkIndex(),
                        Math.round(rc.similarity() * 1000.0) / 1000.0))
                .toList();

        AtomicReference<StringBuilder> full = new AtomicReference<>(new StringBuilder());
        Flux<String> tokens = chatClient.prompt()
                .system(systemPrompt)
                .user(transformedQuery)
                .stream()
                .content()
                .doOnNext(token -> full.get().append(token))
                .doOnComplete(() -> {
                    String answer = full.get().toString();
                    boolean escalated = looksEscalationWorthy(answer);
                    ChatResponse response = new ChatResponse(sessionId, answer, escalated, citations);
                    persistLog(sessionId, principal, redactedQuery, retrieved, response, List.of());
                })
                .doOnError(e -> log.error("Streaming RAG chat call to Azure OpenAI failed (check AZURE_OPENAI_* credentials)", e));

        return new ChatStreamHandle(sessionId, citations, tokens);
    }

    private boolean looksEscalationWorthy(String answer) {
        String lower = answer.toLowerCase();
        return ESCALATION_MARKERS.stream().anyMatch(lower::contains);
    }

    private void persistLog(String sessionId, AuthenticatedUser principal, String redactedQuery,
                             List<RetrievedChunk> retrieved, ChatResponse response, List<String> toolsInvoked) {
        try {
            String chunkRefs = retrieved.stream()
                    .map(rc -> rc.docCode() + "#" + rc.chunkIndex())
                    .collect(Collectors.joining(", "));

            ChatInteractionLog logEntry = ChatInteractionLog.builder()
                    .sessionId(sessionId)
                    .actorUserId(principal != null ? principal.userId() : null)
                    .actorRole(principal != null ? principal.role() : null)
                    .redactedQuery(redactedQuery)
                    .retrievedChunkRefs(chunkRefs)
                    .answer(response.answer())
                    .escalated(response.escalated())
                    .groundedInKb(!retrieved.isEmpty())
                    .toolsInvoked(String.join(", ", toolsInvoked))
                    .createdAt(Instant.now())
                    .build();
            logRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to persist chat interaction log for session {}: {}", sessionId, e.getMessage());
        }
    }
}
