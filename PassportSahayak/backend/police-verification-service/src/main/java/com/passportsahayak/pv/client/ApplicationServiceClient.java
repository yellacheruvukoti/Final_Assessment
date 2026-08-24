package com.passportsahayak.pv.client;

import com.passportsahayak.pv.exception.ApiException;
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

    public ApplicationView getByArn(String arn, String authorizationHeader) {
        try {
            return restClient.get()
                    .uri("/applications/{arn}", arn)
                    .header("Authorization", authorizationHeader)
                    .retrieve()
                    .body(ApplicationView.class);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No application found for ARN " + arn);
        } catch (HttpClientErrorException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "application-service error: " + ex.getMessage());
        }
    }

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
