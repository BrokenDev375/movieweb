package com.movieapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiRecommendationResponseDto(
        @JsonProperty("user_id") Long userId,
        @JsonProperty("is_cold_start") boolean coldStart,
        List<AiRecommendedMovieDto> recommendations
) {
}
