package com.movieapp.service;

import com.movieapp.dto.DashboardSummaryDto;

public interface DashboardService {
    DashboardSummaryDto getDashboardSummary(int topLimit);
}
