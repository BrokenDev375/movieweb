package com.movieapp.controller;

import com.movieapp.dto.RatingDto;
import com.movieapp.entity.Rating;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.RatingService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse<?>> rate(@RequestBody RatingDto ratingDto) {
        ratingService.rate(ratingDto.getMovieId(), ratingDto.getUserId(), ratingDto.getScore());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(ratingDto, "Rating submitted"));
    }

    @GetMapping("/movies/{id}/ratings")
    public ResponseEntity<ApiResponse<?>> getRatingsByMovie(@PathVariable Long id) {
        List<RatingDto> ratingDtos = ratingService.findByMovieId(id);
        return ResponseEntity.ok(ApiResponse.success(ratingDtos));
    }

    @GetMapping("/movies/{id}/ratings/average")
    public ResponseEntity<ApiResponse<?>> getAverageRating(@PathVariable Long id) {
        // TODO: implement
        Double average = ratingService.getAverageScore(id);
        return ResponseEntity.ok(ApiResponse.success(average));
    }

    @DeleteMapping("/ratings")
    public ResponseEntity<ApiResponse<?>> deleteRating(@RequestParam Long movieId,
            @RequestParam Long userId) {
        // TODO: implement
        ratingService.delete(movieId, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Rating deleted"));
    }

    private RatingDto mapToDto(Rating rating) {
        return RatingDto.builder()
                .movieId(rating.getMovie().getId())
                .userId(rating.getUser().getId())
                .score(rating.getScore()).build();
    }
}
