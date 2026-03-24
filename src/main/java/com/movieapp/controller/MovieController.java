package com.movieapp.controller;

import com.movieapp.dto.MovieDto;
import com.movieapp.dto.MovieUrlDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // ── CRUD ──────────────────────────────────────────────────────────────

    // GET /api/movies?page=0&size=10&sortBy=createdAt&direction=desc
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MovieDto>>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(movieService.getAllMovies(pageable)));
    }

    // GET /api/movies/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDto>> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(movieService.getMovieById(id)));
    }

    // POST /api/movies
    @PostMapping
    public ResponseEntity<ApiResponse<MovieDto>> createMovie(@Valid @RequestBody MovieDto dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(movieService.createMovie(dto)));
    }

    // PUT /api/movies/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDto>> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody MovieDto dto) {
        return ResponseEntity.ok(ApiResponse.success(movieService.updateMovie(id, dto)));
    }

    // DELETE /api/movies/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Movie deleted successfully"));
    }

    // ── TÌM KIẾM / LỌC ───────────────────────────────────────────────────

    // GET /api/movies/search?title=avengers
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MovieDto>>> searchByTitle(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                movieService.searchByTitle(title, PageRequest.of(page, size))));
    }

    // GET /api/movies/filter/nation?nation=Korea
    @GetMapping("/filter/nation")
    public ResponseEntity<ApiResponse<Page<MovieDto>>> filterByNation(
            @RequestParam String nation,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                movieService.filterByNation(nation, PageRequest.of(page, size))));
    }

    // GET /api/movies/filter/genre/{genreId}
    @GetMapping("/filter/genre/{genreId}")
    public ResponseEntity<ApiResponse<Page<MovieDto>>> filterByGenre(
            @PathVariable Long genreId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                movieService.filterByGenre(genreId, PageRequest.of(page, size))));
    }

    // ── GẮN / GỠ THỂ LOẠI ────────────────────────────────────────────────

    // POST /api/movies/{movieId}/genres/{genreId}
    @PostMapping("/{movieId}/genres/{genreId}")
    public ResponseEntity<ApiResponse<MovieDto>> addGenre(
            @PathVariable Long movieId,
            @PathVariable Long genreId) {
        return ResponseEntity.ok(ApiResponse.success(
                movieService.addGenreToMovie(movieId, genreId),
                "Genre added to movie"));
    }

    // DELETE /api/movies/{movieId}/genres/{genreId}
    @DeleteMapping("/{movieId}/genres/{genreId}")
    public ResponseEntity<ApiResponse<MovieDto>> removeGenre(
            @PathVariable Long movieId,
            @PathVariable Long genreId) {
        return ResponseEntity.ok(ApiResponse.success(
                movieService.removeGenreFromMovie(movieId, genreId),
                "Genre removed from movie"));
    }

    // ── TẬP PHIM ─────────────────────────────────────────────────────────

    // GET /api/movies/{movieId}/episodes
    @GetMapping("/{movieId}/episodes")
    public ResponseEntity<ApiResponse<List<MovieUrlDto>>> getEpisodes(
            @PathVariable Long movieId) {
        return ResponseEntity.ok(ApiResponse.success(movieService.getEpisodes(movieId)));
    }

    // POST /api/movies/{movieId}/episodes
    @PostMapping("/{movieId}/episodes")
    public ResponseEntity<ApiResponse<MovieUrlDto>> addEpisode(
            @PathVariable Long movieId,
            @Valid @RequestBody MovieUrlDto dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(movieService.addEpisode(movieId, dto)));
    }

    // PUT /api/movies/{movieId}/episodes/{episodeId}
    @PutMapping("/{movieId}/episodes/{episodeId}")
    public ResponseEntity<ApiResponse<MovieUrlDto>> updateEpisode(
            @PathVariable Long movieId,
            @PathVariable Long episodeId,
            @Valid @RequestBody MovieUrlDto dto) {
        return ResponseEntity.ok(ApiResponse.success(
                movieService.updateEpisode(movieId, episodeId, dto)));
    }

    // DELETE /api/movies/{movieId}/episodes/{episodeId}
    @DeleteMapping("/{movieId}/episodes/{episodeId}")
    public ResponseEntity<ApiResponse<Void>> deleteEpisode(
            @PathVariable Long movieId,
            @PathVariable Long episodeId) {
        movieService.deleteEpisode(movieId, episodeId);
        return ResponseEntity.ok(ApiResponse.success(null, "Episode deleted successfully"));
    }
}