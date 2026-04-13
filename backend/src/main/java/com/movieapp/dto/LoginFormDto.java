package com.movieapp.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginFormDto(
        @NotBlank(message = "Không được để trống username hoặc email")
        String username,

        @NotBlank(message = "Không được để trống password")
        String password
) {
}
