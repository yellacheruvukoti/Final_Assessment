package com.passportsahayak.kb.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Tool-calling "modules" the RAG chat model can invoke for live, per-applicant data that
 * doesn't live in the static Knowledge Base - mirrors ApplicationStatusTool and
 * AppointmentBookingTool as referenced throughout the KB documents (e.g. KB-PASS-003 Sec 6,
 * KB-PASS-004 Sec 2.2). EscalationTool is handled by RagChatService setting `escalated=true`
 * on the response rather than as a callable tool (see its class doc).
 */
@Slf4j
@Component
public class PassportSahayakTools {

    private final RestClient applicationServiceRestClient;
    private final RestClient appointmentServiceRestClient;

    public PassportSahayakTools(@Qualifier("applicationServiceRestClient") RestClient applicationServiceRestClient,
                                 @Qualifier("appointmentServiceRestClient") RestClient appointmentServiceRestClient) {
        this.applicationServiceRestClient = applicationServiceRestClient;
        this.appointmentServiceRestClient = appointmentServiceRestClient;
    }

    @Tool(description = "Get the current status of the applicant's own passport application "
            + "(only usable if an application/ARN is already in context for this conversation - "
            + "if none is available, say so rather than asking the user to type their ARN into chat).")
    public String getMyApplicationStatus() {
        AiRequestContext ctx = AiRequestContext.current();
        if (ctx == null || ctx.arn() == null || ctx.authorizationHeader() == null) {
            return "{\"available\": false, \"reason\": \"No application reference is in context for this session.\"}";
        }
        ctx.recordToolCall("ApplicationStatusTool");
        try {
            return applicationServiceRestClient.get()
                    .uri("/applications/{arn}/status", ctx.arn())
                    .header("Authorization", ctx.authorizationHeader())
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            log.warn("ApplicationStatusTool call failed: {}", e.getMessage());
            return "{\"available\": false, \"reason\": \"Status lookup temporarily unavailable.\"}";
        }
    }

    @Tool(description = "Search live PSK/POPSK appointment slot availability for a given center id, "
            + "date (YYYY-MM-DD) and category (NORMAL or TATKAL). Use this when the user asks about "
            + "appointment availability, not for personal application status.")
    public String searchAppointmentSlots(
            @ToolParam(description = "PSK/POPSK center id, e.g. 1") Long centerId,
            @ToolParam(description = "Date in YYYY-MM-DD format") String date,
            @ToolParam(description = "NORMAL or TATKAL") String category) {
        AiRequestContext ctx = AiRequestContext.current();
        if (ctx != null) {
            ctx.recordToolCall("AppointmentBookingTool");
        }
        try {
            return appointmentServiceRestClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/appointments/slots")
                            .queryParam("centerId", centerId)
                            .queryParam("date", date)
                            .queryParam("category", category)
                            .build())
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            log.warn("AppointmentBookingTool call failed: {}", e.getMessage());
            return "{\"available\": false, \"reason\": \"Slot lookup temporarily unavailable.\"}";
        }
    }

    @Tool(description = "List active PSK/POPSK centers (id, name, city, state) so a center id can be "
            + "resolved from a city name before searching slots.")
    public String listCenters() {
        try {
            return appointmentServiceRestClient.get()
                    .uri("/centers")
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            log.warn("listCenters call failed: {}", e.getMessage());
            return "[]";
        }
    }
}
