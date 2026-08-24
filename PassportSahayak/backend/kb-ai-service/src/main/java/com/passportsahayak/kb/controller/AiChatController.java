package com.passportsahayak.kb.controller;

import com.passportsahayak.kb.ai.ChatStreamHandle;
import com.passportsahayak.kb.ai.RagChatService;
import com.passportsahayak.kb.dto.ChatRequest;
import com.passportsahayak.kb.dto.ChatResponse;
import com.passportsahayak.kb.security.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

/**
 * SRS Section 5: POST /ai/passport/chat/sync (structured, grounded, tool-enabled) and
 * POST /ai/passport/chat/async (token-streaming, KB-grounded, no tools - see
 * RagChatService#prepareStream for why). Both are backed by the same RAG pipeline
 * (redaction -&gt; transformation -&gt; retrieval -&gt; grounded generation), and both refuse to
 * answer (allowEmptyContext=false) when nothing in the Knowledge Base clears the
 * similarity threshold.
 *
 * The async endpoint uses SseEmitter (Servlet 3 async), NOT a directly-returned Flux -
 * returning a Flux/Mono of ServerSentEvent straight from a Spring MVC (non-WebFlux)
 * controller does not reliably carry the Spring Security authentication context across
 * the async dispatch boundary and gets killed mid-stream by a security recheck; SseEmitter
 * is the mechanism Spring Security's WebAsyncManagerIntegrationFilter actually supports.
 */
@Slf4j
@RestController
@RequestMapping("/ai/passport")
@RequiredArgsConstructor
public class AiChatController {

    private final RagChatService ragChatService;

    @PostMapping("/chat/sync")
    public ResponseEntity<ChatResponse> chatSync(@AuthenticationPrincipal AuthenticatedUser principal,
                                                  @Valid @RequestBody ChatRequest request,
                                                  HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        return ResponseEntity.ok(ragChatService.chat(principal, request, authorizationHeader));
    }

    @PostMapping(value = "/chat/async", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatAsync(@AuthenticationPrincipal AuthenticatedUser principal,
                                 @Valid @RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(120_000L);
        ChatStreamHandle handle = ragChatService.prepareStream(principal, request);

        // Captured on the original (authenticated) request thread. Reactor's streaming
        // callbacks run on a different thread, and when the stream completes Tomcat
        // re-enters the security filter chain for the ASYNC dispatch - JwtAuthFilter
        // (a OncePerRequestFilter) deliberately does not re-run for that dispatch, so
        // without restoring this captured context the re-dispatch finds no authenticated
        // user and the whole response gets killed with AuthorizationDeniedException.
        SecurityContext capturedContext = SecurityContextHolder.getContext();

        handle.tokens().subscribe(
                token -> withSecurityContext(capturedContext,
                        () -> sendEvent(emitter, "token", Map.of("token", token))),
                error -> withSecurityContext(capturedContext, () -> {
                    log.error("SSE stream error for session {}", handle.sessionId(), error);
                    emitter.completeWithError(error);
                }),
                () -> withSecurityContext(capturedContext, () -> {
                    sendEvent(emitter, "done", Map.of(
                            "sessionId", handle.sessionId(),
                            "citations", handle.citations()));
                    emitter.complete();
                })
        );

        return emitter;
    }

    private void withSecurityContext(SecurityContext context, Runnable action) {
        SecurityContext previous = SecurityContextHolder.getContext();
        try {
            SecurityContextHolder.setContext(context);
            action.run();
        } finally {
            SecurityContextHolder.setContext(previous);
        }
    }

    private void sendEvent(SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}
