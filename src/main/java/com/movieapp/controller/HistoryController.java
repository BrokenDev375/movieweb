package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.HistoryService;
import lombok.RequiredArgsConstructor;
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
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> saveHistory(@RequestBody Object historyRequest) {
        // TODO: implement
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "History saved"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteHistory(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null, "History deleted"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<?>> clearHistory() {
        // TODO: implement - clear all history for current user
        return ResponseEntity.ok(ApiResponse.success(null, "History cleared"));
    }
}
