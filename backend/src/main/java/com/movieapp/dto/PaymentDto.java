package com.movieapp.dto;

import java.time.LocalDateTime;

public record PaymentDto(
        Long id,
        Long amount,
        String orderInfo,
        String status,
        Integer planDurationDays,
        LocalDateTime createdAt,
        LocalDateTime paidAt
) {
}
