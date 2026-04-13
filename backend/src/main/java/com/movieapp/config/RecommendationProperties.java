package com.movieapp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "recommendation.service")
public class RecommendationProperties {
    private String baseUrl = "http://localhost:8000";
    private long connectTimeoutMs = 2000;
    private long readTimeoutMs = 5000;
}
