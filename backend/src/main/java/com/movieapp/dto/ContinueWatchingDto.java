package com.movieapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContinueWatchingDto {
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private Long movieUrlId;
    private Integer episode;
    private String watchUrl;
    private Integer watchTime;
    private LocalDateTime updatedAt;
}
