package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getFavorites() {
        // TODO: get current user id from security context
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> addFavorite(@RequestBody Object favoriteRequest) {
        // TODO: implement
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "Added to favorites"));
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<ApiResponse<?>> removeFavorite(@PathVariable Long movieId) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null, "Removed from favorites"));
    }
}
