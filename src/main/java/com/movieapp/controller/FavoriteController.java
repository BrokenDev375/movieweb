package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.movieapp.dto.FavoriteDto;
import com.movieapp.entity.Favorite;
import com.movieapp.entity.Movie;
import com.movieapp.entity.User;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.MovieRepository;
import com.movieapp.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import com.movieapp.exception.AppException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getFavorites() {
        Long userId = getCurrentUserId();
        List<FavoriteDto> favoriteDtos = favoriteService.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(favoriteDtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> addFavorite(@RequestBody FavoriteDto request) {
        Long userId = getCurrentUserId();
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Movie", request.getMovieId()));
        FavoriteDto favoriteDto = favoriteService.addFavorite(userId, movie.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(favoriteDto, "Added to favorites"));
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<ApiResponse<?>> removeFavorite(@PathVariable Long movieId) {
        Long userId = getCurrentUserId();
        favoriteService.removeFavorite(userId, movieId);
        return ResponseEntity.ok(ApiResponse.success(null, "Removed from favorites"));
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameOrEmail(username)
                .map(User::getId)
                .orElseThrow(() -> new AppException("User not found"));
    }

    private FavoriteDto mapToDto(Favorite favorite) {
        if (favorite == null)
            return null;
        return FavoriteDto.builder()
                .userId(favorite.getUser().getId())
                .movieId(favorite.getMovie().getId())
                .movieTitle(favorite.getMovie().getTitle())
                .moviePosterUrl(favorite.getMovie().getPosterUrl())
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}
