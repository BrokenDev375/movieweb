package com.movieapp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(
        @NotNull(message = "Plan is required")
        String plan  // "1month", "3months", "12months"
) {
}
