package com.movieapp.repository;

import com.movieapp.dto.TopFavoriteMovieDto;
import com.movieapp.entity.Favorite;
import com.movieapp.entity.key.FavoriteId;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    boolean existsByUser_IdAndMovie_Id(Long userId, Long movieId);

    List<Favorite> findByUser_Id(Long UserId);

    void deleteByUser_IdAndMovie_Id(Long UserId, Long MovieId);

    @Query("""
            SELECT new com.movieapp.dto.TopFavoriteMovieDto(
                f.movie.id,
                f.movie.title,
                f.movie.posterUrl,
                COUNT(f)
            )
            FROM Favorite f
            GROUP BY f.movie.id, f.movie.title, f.movie.posterUrl
            ORDER BY COUNT(f) DESC
            """)
    List<TopFavoriteMovieDto> findTopFavoriteMovies(Pageable pageable);
}
