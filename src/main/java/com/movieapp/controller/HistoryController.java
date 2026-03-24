package com.movieapp.controller;

import com.movieapp.dto.HistoryDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.HistoryService;
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

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getHistory() {
        // TODO: get current user id from security context
        Long userId = 1L;
        List<HistoryDto> historyDtos = historyService.findByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(historyDtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> saveHistory(@RequestBody HistoryDto historyRequest) {
        // TODO: implement
        Long userId = 1L;

        // 2. Gọi service xử lý logic Save hoặc Update
        // Đảm bảo HistoryDto của bạn có các trường movieId và watchTime
        HistoryDto savedDto = historyService.saveOrUpdate(
                userId,
                historyRequest.getMovieId(),
                historyRequest.getWatchTime());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(savedDto, "History saved"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteHistory(@PathVariable Long id) {
        // TODO: implement
        historyService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "History deleted"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<?>> clearHistory() {
        // TODO: implement - clear all history for current user
        Long userId = 1L;
        historyService.deleteAllByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "History cleared"));
    }
}
