package com.movieapp.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveHistoryDto {
    @NotNull(message = "Movie URL id is required")
    private Long movieUrlId;

    @NotNull(message = "Watch time is required")
    @Min(value = 0, message = "Watch time must be greater than or equal to 0")
    private Integer watchTime;
}
