package com.movieapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@ConfigurationProperties("vnpay")
public record VnPayProperties(
        String tmnCode,
        String hashSecret,
        String payUrl,
        String returnUrl
) {
    @ConstructorBinding
    public VnPayProperties {
    }
}
