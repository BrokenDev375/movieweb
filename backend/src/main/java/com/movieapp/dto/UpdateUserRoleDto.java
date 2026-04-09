package com.movieapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateUserRoleDto(
        @NotBlank(message = "Role is required")
        @Pattern(regexp = "^(USER|ADMIN)$", message = "Role must be USER or ADMIN")
        String role
) {
}
