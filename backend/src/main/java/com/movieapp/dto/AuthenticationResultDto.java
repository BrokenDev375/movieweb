package com.movieapp.dto;

import java.time.LocalDateTime;

public record AuthenticationResultDto(
        Long id,
        String username,
        String email,
        String role,
        String accessToken,
        LocalDateTime premiumUntil
) {
}
