package com.movieapp.service.impl;

import com.movieapp.entity.Rating;
import com.movieapp.repository.RatingRepository;
import com.movieapp.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findByMovieId(Long movieId) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Rating> findByUserId(Long userId) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Rating> findByMovieIdAndUserId(Long movieId, Long userId) {
        // TODO: implement
        return Optional.empty();
    }

    @Override
    @Transactional
    public Rating rate(Long movieId, Long userId, Byte score) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public void delete(Long movieId, Long userId) {
        // TODO: implement
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageScore(Long movieId) {
        // TODO: implement
        return null;
    }
}
