package com.movieapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateProfileDto(
        @NotBlank(message = "Email is required")
        @Email(message = "Email is invalid")
        String email
) {
}
