package com.movieapp.controller;

import com.movieapp.dto.GenreDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.GenreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    // GET /api/genres → lấy tất cả thể loại
    @GetMapping
    public ResponseEntity<ApiResponse<List<GenreDto>>> getAllGenres() {
        return ResponseEntity.ok(ApiResponse.success(genreService.getAllGenres()));
    }

    // GET /api/genres/{id} → lấy 1 thể loại
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreDto>> getGenreById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(genreService.getGenreById(id)));
    }

    // POST /api/genres → tạo thể loại mới
    @PostMapping
    public ResponseEntity<ApiResponse<GenreDto>> createGenre(@Valid @RequestBody GenreDto dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(genreService.createGenre(dto)));
    }

    // PUT /api/genres/{id} → cập nhật thể loại
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreDto>> updateGenre(
            @PathVariable Long id,
            @Valid @RequestBody GenreDto dto) {
        return ResponseEntity.ok(ApiResponse.success(genreService.updateGenre(id, dto)));
    }

    // DELETE /api/genres/{id} → xoá thể loại
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Genre deleted successfully"));
    }
}