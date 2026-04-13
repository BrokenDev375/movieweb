package com.movieapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

@ConfigurationProperties("security.jwt")
public record JwtProperties(
        String secret,
        Long expirationMs
) {
    @ConstructorBinding
    public JwtProperties {

    }
}
