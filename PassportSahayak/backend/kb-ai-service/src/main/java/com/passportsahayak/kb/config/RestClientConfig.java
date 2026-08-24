package com.passportsahayak.kb.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    @Qualifier("applicationServiceRestClient")
    public RestClient applicationServiceRestClient(@Value("${app.clients.application-service}") String baseUrl) {
        return RestClient.builder().baseUrl(baseUrl).build();
    }

    @Bean
    @Qualifier("appointmentServiceRestClient")
    public RestClient appointmentServiceRestClient(@Value("${app.clients.appointment-service}") String baseUrl) {
        return RestClient.builder().baseUrl(baseUrl).build();
    }
}
