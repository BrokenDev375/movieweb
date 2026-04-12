package com.movieapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiRecommendedMovieDto(
        int rank,
        @JsonProperty("movie_id") Long movieId,
        @JsonProperty("predicted_rating") Double predictedRating
) {
}
