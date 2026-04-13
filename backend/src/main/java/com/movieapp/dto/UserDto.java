package com.movieapp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for User requests and responses.
 * TODO: Add fields as needed by the team.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserDto(
        Long id,
        String username,
        String email,
        String role,
        java.time.LocalDateTime premiumUntil
) {
}
