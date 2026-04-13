package com.movieapp.controller;

import com.movieapp.dto.SaveHistoryDto;
import com.movieapp.dto.HistoryDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.HistoryService;
import com.movieapp.repository.UserRepository;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import jakarta.validation.Valid;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getHistory() {
        Long userId = getCurrentUserId();
        List<HistoryDto> historyDtos = historyService.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(historyDtos));
    }

    @GetMapping("/continue-watching")
    public ResponseEntity<ApiResponse<?>> getContinueWatching() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(historyService.getContinueWatching(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> saveHistory(@Valid @RequestBody SaveHistoryDto historyRequest) {
        Long userId = getCurrentUserId();
        HistoryDto savedDto = historyService.saveOrUpdate(
                userId,
                historyRequest.getMovieUrlId(),
                historyRequest.getWatchTime());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(savedDto, "History saved"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteHistory(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        historyService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "History deleted"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<?>> clearHistory() {
        Long userId = getCurrentUserId();
        historyService.deleteAllByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "History cleared"));
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameOrEmail(username)
                .map(User::getId)
                .orElseThrow(() -> new AppException("User not found"));
    }
}
