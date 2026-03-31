package com.movieapp.repository;

import com.movieapp.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    // Tìm genre theo tên (không phân biệt hoa thường)
    Optional<Genre> findByNameIgnoreCase(String name);

    // Kiểm tra tên genre đã tồn tại chưa
    boolean existsByNameIgnoreCase(String name);
}