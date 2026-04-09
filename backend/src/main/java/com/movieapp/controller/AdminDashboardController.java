package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getDashboardSummary(
            @RequestParam(defaultValue = "5") int topLimit
    ) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardSummary(topLimit)));
    }
}
