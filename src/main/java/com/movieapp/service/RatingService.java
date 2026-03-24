package com.movieapp.service;

import com.movieapp.dto.RatingDto;
import com.movieapp.entity.Rating;

import java.util.List;
import java.util.Optional;

public interface RatingService {

    List<RatingDto> findByMovieId(Long movieId);

    List<RatingDto> findByUserId(Long userId);

    Optional<RatingDto> findByMovieIdAndUserId(Long movieId, Long userId);

    RatingDto rate(Long movieId, Long userId, Byte score);

    void delete(Long movieId, Long userId);

    Double getAverageScore(Long movieId);
}
