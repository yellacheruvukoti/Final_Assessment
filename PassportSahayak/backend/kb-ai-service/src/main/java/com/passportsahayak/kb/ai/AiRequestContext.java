package com.passportsahayak.kb.ai;

import java.util.ArrayList;
import java.util.List;

/**
 * Per-request context for tool-calling, bound via ThreadLocal for the lifetime of a single
 * chat request. Deliberately carries the ARN as a STRUCTURED field rather than letting the
 * model extract it from free text - the query text the model sees has already had PII
 * (including ARNs) redacted per SRS Sec 4.1.6, so tools that need an identifier read it from
 * here instead of asking the model to parse it out of the (redacted) conversation.
 */
public final class AiRequestContext {

    private static final ThreadLocal<AiRequestContext> CURRENT = new ThreadLocal<>();

    private final String arn;
    private final String authorizationHeader;
    private final List<String> toolsInvoked = new ArrayList<>();

    private AiRequestContext(String arn, String authorizationHeader) {
        this.arn = arn;
        this.authorizationHeader = authorizationHeader;
    }

    public static void bind(String arn, String authorizationHeader) {
        CURRENT.set(new AiRequestContext(arn, authorizationHeader));
    }

    public static AiRequestContext current() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }

    public String arn() {
        return arn;
    }

    public String authorizationHeader() {
        return authorizationHeader;
    }

    public void recordToolCall(String toolName) {
        toolsInvoked.add(toolName);
    }

    public List<String> toolsInvoked() {
        return toolsInvoked;
    }
}
