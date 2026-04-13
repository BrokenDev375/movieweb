package com.movieapp.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for History requests and responses.
 * TODO: Add fields as needed by the team.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryDto {
    private Long id;
    private Long movieUrlId;
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private Integer episode;
    private String watchUrl;
    private Long userId;
    private Integer watchTime;
    private LocalDateTime updatedAt;
}
