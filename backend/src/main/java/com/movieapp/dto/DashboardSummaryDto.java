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
public class DashboardSummaryDto {
    private long totalUsers;
    private long totalMovies;
    private long totalGenres;
    private long totalComments;
    private long totalRatings;
    private long totalFavorites;
    private long totalHistories;
    private List<TopFavoriteMovieDto> topFavoriteMovies;
    private List<TopRatedMovieDto> topRatedMovies;
    private List<TopWatchedMovieDto> topWatchedMovies;
}
