package com.movieapp.repository;

import com.movieapp.dto.TopRatedMovieDto;
import com.movieapp.entity.Rating;
import com.movieapp.entity.key.RatingId;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, RatingId> {
    List<Rating> findByMovie_Id(Long MovieId);
    List<Rating> findByUser_Id(Long UserId);
    Optional<Rating> findByUser_IdAndMovie_Id(Long UserId , Long MovieId);
    void deleteByUser_IdAndMovie_Id(Long UserId , Long MovieId);
    @Query("SELECT COALESCE(AVG(r.score), 0) FROM Rating r WHERE r.movie.id = :movieId")
    Double getAverageScore(@Param("movieId") long movieID);

    @Query("""
            SELECT new com.movieapp.dto.TopRatedMovieDto(
                r.movie.id,
                r.movie.title,
                r.movie.posterUrl,
                AVG(r.score),
                COUNT(r)
            )
            FROM Rating r
            GROUP BY r.movie.id, r.movie.title, r.movie.posterUrl
            ORDER BY AVG(r.score) DESC, COUNT(r) DESC
            """)
    List<TopRatedMovieDto> findTopRatedMovies(Pageable pageable);
}
