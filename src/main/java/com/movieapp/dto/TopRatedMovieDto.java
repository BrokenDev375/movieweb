package com.movieapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TopRatedMovieDto {
    private Long movieId;
    private String title;
    private String posterUrl;
    private Double averageRating;
    private Long ratingCount;
}
