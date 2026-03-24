package com.movieapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DTO for Favorite requests and responses.
 * TODO: Add fields as needed by the team.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoriteDto {
    @NotNull(message = "User ID is required")
    private Long userId;
    @NotNull(message = "Movie ID is required")
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private LocalDateTime createdAt;
}
