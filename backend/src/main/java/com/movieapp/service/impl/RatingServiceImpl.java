package com.movieapp.service.impl;

import com.movieapp.dto.RatingDto;
import com.movieapp.entity.Movie;
import com.movieapp.entity.Rating;
import com.movieapp.entity.User;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.MovieRepository;
import com.movieapp.repository.RatingRepository;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RatingDto> findByMovieId(Long movieId) {
        // TODO: implement
        return ratingRepository.findByMovie_Id(movieId).stream()
                .map(rating -> mapToDto(rating))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RatingDto> findByUserId(Long userId) {
        // TODO: implement
        return ratingRepository.findByUser_Id(userId).stream()
                .map(rating -> mapToDto(rating))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RatingDto> findByMovieIdAndUserId(Long movieId, Long userId) {
        // TODO: implement
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", movieId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return ratingRepository.findByUser_IdAndMovie_Id(userId, movieId)
                .map(rating -> mapToDto(rating));
    }

    @Override
    @Transactional
    public RatingDto rate(Long movieId, Long userId, Byte score) {
        // TODO: implement
        Rating rating = ratingRepository.findByUser_IdAndMovie_Id(userId, movieId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    Movie movie = movieRepository.findById(movieId)
                            .orElseThrow(() -> new RuntimeException("Movie not found"));

                    Rating newRating = new Rating();
                    newRating.setUser(user);
                    newRating.setMovie(movie);
                    return newRating;
                });
        rating.setScore(score);
        Rating savedRating = ratingRepository.save(rating);
        return mapToDto(savedRating);
    }

    @Override
    @Transactional
    public void delete(Long movieId, Long userId) {
        ratingRepository.deleteByUser_IdAndMovie_Id(userId, movieId);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageScore(Long movieId) {
        // TODO: implement
        return ratingRepository.getAverageScore(movieId);
    }

    RatingDto mapToDto(Rating rating) {
        return RatingDto.builder()
                .movieId(rating.getMovie().getId())
                .userId(rating.getUser().getId())
                .score(rating.getScore())
                .build();
    }
}
