package com.movieapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TopFavoriteMovieDto {
    private Long movieId;
    private String title;
    private String posterUrl;
    private Long favoriteCount;
}
