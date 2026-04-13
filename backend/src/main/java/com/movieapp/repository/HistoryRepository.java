package com.movieapp.repository;

import com.movieapp.dto.TopWatchedMovieDto;
import com.movieapp.entity.History;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    @EntityGraph(attributePaths = {"movieUrl", "movieUrl.movie"})
    List<History> findByUser_IdOrderByUpdatedAtDesc(Long id);

    Optional<History> findByUser_IdAndMovieUrl_Id(Long userId, Long movieUrlId);

    void deleteByUser_Id(Long UserId);

    boolean existsByUser_IdAndMovieUrl_Id(Long UserId, Long movieUrlId);

    void deleteAllByUser_Id(Long id);

    Optional<History> findByIdAndUser_Id(Long id, Long userId);

    @Query("""
            SELECT new com.movieapp.dto.TopWatchedMovieDto(
                h.movieUrl.movie.id,
                h.movieUrl.movie.title,
                h.movieUrl.movie.posterUrl,
                COUNT(DISTINCT h.user.id)
            )
            FROM History h
            GROUP BY h.movieUrl.movie.id, h.movieUrl.movie.title, h.movieUrl.movie.posterUrl
            ORDER BY COUNT(DISTINCT h.user.id) DESC
            """)
    List<TopWatchedMovieDto> findTopWatchedMovies(Pageable pageable);
}
