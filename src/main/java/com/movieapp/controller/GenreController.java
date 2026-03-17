package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllGenres() {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getGenreById(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createGenre(@RequestBody Object genreRequest) {
        // TODO: implement
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "Genre created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateGenre(@PathVariable Long id, @RequestBody Object genreRequest) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteGenre(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null, "Genre deleted"));
    }
}
