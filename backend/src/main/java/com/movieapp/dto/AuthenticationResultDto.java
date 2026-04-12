package com.movieapp.dto;

public record AuthenticationResultDto(
        Long id,
        String username,
        String email,
        String role,
        String accessToken
) {
}
