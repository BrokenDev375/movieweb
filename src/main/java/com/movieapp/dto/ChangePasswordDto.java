package com.movieapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.Length;

public record ChangePasswordDto(
        @NotBlank(message = "Old password is required")
        String oldPassword,

        @NotBlank(message = "New password is required")
        @Length(min = 8, message = "New password must be at least 8 characters")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$", message = "New password must contain both letters and numbers")
        String newPassword,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {
}
