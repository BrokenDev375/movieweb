package com.movieapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenreDto {

    private Long id; // server trả về, client không cần gửi

    @NotBlank(message = "Genre name is required")
    @Size(max = 100, message = "Genre name must not exceed 100 characters")
    private String name;
}