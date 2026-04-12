package com.movieapp.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
@RequiredArgsConstructor
public class RecommendationConfig {

    private final RecommendationProperties recommendationProperties;

    @Bean
    public RestTemplate recommendationRestTemplate(RestTemplateBuilder builder) {
        return builder
                .rootUri(recommendationProperties.getBaseUrl())
                .setConnectTimeout(Duration.ofMillis(recommendationProperties.getConnectTimeoutMs()))
                .setReadTimeout(Duration.ofMillis(recommendationProperties.getReadTimeoutMs()))
                .build();
    }
}
