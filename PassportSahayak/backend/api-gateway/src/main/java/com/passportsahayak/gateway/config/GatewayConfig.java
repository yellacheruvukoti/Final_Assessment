package com.passportsahayak.gateway.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(RouteProperties.class)
public class GatewayConfig {

    @Bean
    public RestClient gatewayRestClient() {
        return RestClient.builder().build();
    }
}
