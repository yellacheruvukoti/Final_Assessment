package com.passportsahayak.gateway.controller;

import com.passportsahayak.gateway.config.RouteProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Single entry point for the Angular frontend. Reverse-proxies every request to the
 * appropriate downstream microservice based on a configured path-prefix -> base-URL table
 * (see application.yml app.routes), forwarding method, headers and body unchanged.
 */
@RestController
public class GatewayController {

    private static final List<String> HOP_BY_HOP_HEADERS = List.of(
            "host", "content-length", "connection", "transfer-encoding");

    private final RestClient restClient;
    private final List<RouteProperties.Route> routes;

    public GatewayController(RestClient gatewayRestClient, RouteProperties routeProperties) {
        this.restClient = gatewayRestClient;
        this.routes = routeProperties.getRoutes().stream()
                .sorted(Comparator.comparingInt((RouteProperties.Route r) -> r.getPrefix().length()).reversed())
                .toList();
    }

    @RequestMapping("/**")
    public ResponseEntity<byte[]> proxy(HttpServletRequest request,
                                         @RequestBody(required = false) byte[] body) throws IOException {
        String path = request.getRequestURI();
        String query = request.getQueryString();

        RouteProperties.Route route = routes.stream()
                .filter(r -> path.equals(r.getPrefix()) || path.startsWith(r.getPrefix() + "/"))
                .findFirst()
                .orElse(null);

        if (route == null) {
            return ResponseEntity.notFound().build();
        }

        String targetUrl = route.getTarget() + path + (query != null ? "?" + query : "");

        RestClient.RequestBodySpec requestSpec = restClient
                .method(HttpMethod.valueOf(request.getMethod()))
                .uri(targetUrl);

        Collections.list(request.getHeaderNames()).forEach(name -> {
            if (!HOP_BY_HOP_HEADERS.contains(name.toLowerCase())) {
                Collections.list(request.getHeaders(name)).forEach(value -> requestSpec.header(name, value));
            }
        });

        if (body != null && body.length > 0) {
            requestSpec.body(body);
        }

        return requestSpec.exchange((clientRequest, clientResponse) -> {
            byte[] responseBody = clientResponse.getBody() != null ? clientResponse.getBody().readAllBytes() : new byte[0];
            HttpStatusCode status = clientResponse.getStatusCode();
            HttpHeaders responseHeaders = new HttpHeaders();
            clientResponse.getHeaders().forEach((name, values) -> {
                if (!HOP_BY_HOP_HEADERS.contains(name.toLowerCase())) {
                    responseHeaders.put(name, values);
                }
            });
            return ResponseEntity.status(status).headers(responseHeaders).body(responseBody);
        }, false);
    }
}
