package com.movieapp.repository;

import com.movieapp.entity.MovieUrl;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieUrlRepository extends JpaRepository<MovieUrl, Long> {

    // Lấy tất cả tập của 1 phim, sắp xếp theo số tập tăng dần
    List<MovieUrl> findByMovieIdOrderByEpisodeAsc(Long movieId);

    // Kiểm tra tập đó đã tồn tại chưa (tránh trùng số tập)
    boolean existsByMovieIdAndEpisode(Long movieId, Integer episode);
}