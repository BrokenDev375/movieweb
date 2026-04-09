package com.movieapp.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for Comment requests and responses.
 * TODO: Add fields as needed by the team.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    // TODO: implement fields
    private Long id;
    private Long movieId;
    private Long userId;
    private String content;
    private LocalDateTime createdAt;
}
