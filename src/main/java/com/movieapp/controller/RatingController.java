package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse<?>> rate(@RequestBody Object ratingRequest) {
        // TODO: implement
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "Rating submitted"));
    }

    @GetMapping("/movies/{id}/ratings")
    public ResponseEntity<ApiResponse<?>> getRatingsByMovie(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/movies/{id}/ratings/average")
    public ResponseEntity<ApiResponse<?>> getAverageRating(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/ratings/{movieId}")
    public ResponseEntity<ApiResponse<?>> deleteRating(@PathVariable Long movieId) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null, "Rating deleted"));
    }
}
