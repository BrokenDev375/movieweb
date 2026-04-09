package com.movieapp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for History requests and responses.
 * TODO: Add fields as needed by the team.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoryDto {
    private Long id;
    private Long movieId;
    private Long userId;
    private Integer watchTime;
    private LocalDateTime updatedAt;
}
