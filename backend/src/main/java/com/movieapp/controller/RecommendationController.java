package com.movieapp.controller;

import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import com.movieapp.repository.UserRepository;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getMyRecommendations(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int n
    ) {
        Long userId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.getRecommendationsForUser(userId, n)
        ));
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getRecommendationsForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int n
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.getRecommendationsForUser(userId, n)
        ));
    }

    private Long getCurrentUserId(Authentication authentication) {
        return userRepository.findByUsernameOrEmail(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new AppException("User not found"));
    }
}
