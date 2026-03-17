package com.movieapp.service;

import com.movieapp.entity.Rating;

import java.util.List;
import java.util.Optional;

public interface RatingService {

    List<Rating> findByMovieId(Long movieId);

    List<Rating> findByUserId(Long userId);

    Optional<Rating> findByMovieIdAndUserId(Long movieId, Long userId);

    Rating rate(Long movieId, Long userId, Byte score);

    void delete(Long movieId, Long userId);

    Double getAverageScore(Long movieId);
}
