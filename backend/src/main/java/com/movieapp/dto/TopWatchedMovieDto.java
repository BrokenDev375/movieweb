package com.movieapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TopWatchedMovieDto {
    private Long movieId;
    private String title;
    private String posterUrl;
    private Long watchCount;
}
