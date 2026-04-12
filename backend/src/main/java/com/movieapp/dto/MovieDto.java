package com.movieapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieDto {

    // --- Chỉ server trả về (response) ---
    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<GenreDto> genres; // thể loại đầy đủ (id + name)
    private List<MovieUrlDto> movieUrls; // danh sách tập phim

    // --- Client gửi lên khi tạo/sửa (request) ---
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private LocalDate releaseDate;

    @Size(max = 500)
    private String trailerUrl;

    @Size(max = 500)
    private String posterUrl;

    private String description;

    @Size(max = 100)
    private String nation;

    private List<Long> genreIds; // danh sách ID thể loại khi tạo/sửa phim
}