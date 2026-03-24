package com.movieapp.repository;

import com.movieapp.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    // Tìm phim theo tên (không phân biệt hoa thường, có phân trang)
    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Lọc phim theo quốc gia
    Page<Movie> findByNationIgnoreCase(String nation, Pageable pageable);

    // Lọc phim theo thể loại (JOIN vì many-to-many)
    @Query("SELECT DISTINCT m FROM Movie m JOIN m.genres g WHERE g.id = :genreId")
    Page<Movie> findByGenreId(@Param("genreId") Long genreId, Pageable pageable);
}