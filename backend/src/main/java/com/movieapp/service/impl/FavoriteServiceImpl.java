package com.movieapp.service.impl;

import com.movieapp.dto.FavoriteDto;
import com.movieapp.entity.Favorite;
import com.movieapp.entity.Movie;
import com.movieapp.entity.User;
import com.movieapp.entity.key.FavoriteId;
import com.movieapp.exception.BadRequestException;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.FavoriteRepository;
import com.movieapp.repository.MovieRepository;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FavoriteDto> findByUserId(Long userId) {
        return favoriteRepository.findByUser_Id(userId).stream()
                .map(favorite -> mapToDto(favorite))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FavoriteDto addFavorite(Long userId, Long movieId) {
        if (favoriteRepository.existsByUser_IdAndMovie_Id(userId, movieId)) {
            throw new BadRequestException("Favorite already exists");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + movieId));
        Favorite favorite = Favorite.builder()
                .id(new FavoriteId(userId, movieId))
                .user(user)
                .movie(movie)
                .build();
        favoriteRepository.save(favorite);
        return mapToDto(favorite);
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long movieId) {
        if (!favoriteRepository.existsByUser_IdAndMovie_Id(userId, movieId)) {
            throw new BadRequestException("Favorite not found");
        }
        favoriteRepository.deleteByUser_IdAndMovie_Id(userId, movieId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long movieId) {
        return favoriteRepository.existsByUser_IdAndMovie_Id(userId, movieId);
    }

    FavoriteDto mapToDto(Favorite favorite) {
        return FavoriteDto.builder()
                .movieId(favorite.getMovie().getId())
                .userId(favorite.getUser().getId())
                .movieTitle(favorite.getMovie().getTitle())
                .moviePosterUrl(favorite.getMovie().getPosterUrl())
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}
