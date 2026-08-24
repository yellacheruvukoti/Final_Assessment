package com.passportsahayak.appointment.client;

import com.passportsahayak.appointment.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
public class ApplicationServiceClient {

    private final RestClient restClient;
    private final String internalApiKey;

    public ApplicationServiceClient(RestClient applicationServiceRestClient,
                                     @Value("${app.internal.api-key}") String internalApiKey) {
        this.restClient = applicationServiceRestClient;
        this.internalApiKey = internalApiKey;
    }

    /** Fetches the application on behalf of the calling user by forwarding their bearer token. */
    public ApplicationView getByArn(String arn, String authorizationHeader) {
        try {
            return restClient.get()
                    .uri("/applications/{arn}", arn)
                    .header("Authorization", authorizationHeader)
                    .retrieve()
                    .body(ApplicationView.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No application found for ARN " + arn);
        } catch (HttpClientErrorException.Forbidden ex) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this application");
        } catch (HttpClientErrorException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "application-service error: " + ex.getMessage());
        }
    }

    /** Service-to-service status push, authenticated with the shared internal key (no user context). */
    public void updateStatus(String arn, String status, String pvType, String remarks) {
        try {
            restClient.patch()
                    .uri("/internal/applications/{arn}/status", arn)
                    .header("X-Internal-Key", internalApiKey)
                    .body(new InternalStatusUpdateRequest(status, pvType, remarks))
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Failed to update application status: " + ex.getMessage());
        }
    }
}
