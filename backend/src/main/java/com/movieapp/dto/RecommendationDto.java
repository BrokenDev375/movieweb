package com.movieapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDto {
    private Long userId;
    private boolean coldStart;
    private List<RecommendedMovieDto> recommendations;
}
