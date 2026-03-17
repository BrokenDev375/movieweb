package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllMovies() {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getMovieById(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createMovie(@RequestBody Object movieRequest) {
        // TODO: implement
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "Movie created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateMovie(@PathVariable Long id, @RequestBody Object movieRequest) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteMovie(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null, "Movie deleted"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchMovies(@RequestParam String title) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
