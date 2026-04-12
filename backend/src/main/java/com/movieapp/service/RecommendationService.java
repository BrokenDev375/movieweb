package com.movieapp.service;

import com.movieapp.dto.RecommendationDto;

public interface RecommendationService {
    RecommendationDto getRecommendationsForUser(Long userId, int n);
}
