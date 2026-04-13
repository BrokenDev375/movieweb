package com.movieapp.service.impl;

import com.movieapp.dto.AiRecommendedMovieDto;
import com.movieapp.dto.AiRecommendationResponseDto;
import com.movieapp.dto.MovieDto;
import com.movieapp.dto.RecommendationDto;
import com.movieapp.dto.RecommendedMovieDto;
import com.movieapp.exception.AppException;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.service.MovieService;
import com.movieapp.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final RestTemplate recommendationRestTemplate;
    private final MovieService movieService;

    @Override
    public RecommendationDto getRecommendationsForUser(Long userId, int n) {
        int safeN = Math.max(1, Math.min(n, 50));
        AiRecommendationResponseDto aiResponse = fetchAiRecommendations(userId, safeN);
        List<AiRecommendedMovieDto> aiItems = aiResponse.recommendations() == null
                ? List.of()
                : aiResponse.recommendations();

        List<RecommendedMovieDto> recommendations = new ArrayList<>();
        for (AiRecommendedMovieDto item : aiItems) {
            try {
                MovieDto movie = movieService.getMovieById(item.movieId());
                recommendations.add(RecommendedMovieDto.builder()
                        .rank(item.rank())
                        .predictedRating(item.predictedRating())
                        .movie(movie)
                        .build());
            } catch (ResourceNotFoundException ignored) {
                // Ignore movies returned by the AI service that do not exist in the current DB.
            }
        }

        return RecommendationDto.builder()
                .userId(aiResponse.userId())
                .coldStart(aiResponse.coldStart())
                .recommendations(recommendations)
                .build();
    }

    private AiRecommendationResponseDto fetchAiRecommendations(Long userId, int n) {
        try {
            AiRecommendationResponseDto response = recommendationRestTemplate.getForObject(
                    "/recommend/{userId}?n={n}",
                    AiRecommendationResponseDto.class,
                    userId,
                    n
            );

            if (response == null) {
                throw new AppException(
                        "Recommendation service returned an empty response",
                        HttpStatus.SERVICE_UNAVAILABLE.value()
                );
            }

            return response;
        } catch (ResourceAccessException ex) {
            throw new AppException(
                    "Recommendation service is unavailable",
                    HttpStatus.SERVICE_UNAVAILABLE.value()
            );
        } catch (HttpStatusCodeException ex) {
            throw new AppException(
                    "Recommendation service is unavailable",
                    HttpStatus.SERVICE_UNAVAILABLE.value()
            );
        } catch (RestClientException ex) {
            throw new AppException(
                    "Recommendation service is unavailable",
                    HttpStatus.SERVICE_UNAVAILABLE.value()
            );
        }
    }
}
