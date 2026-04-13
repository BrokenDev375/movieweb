package com.movieapp.repository;

import com.movieapp.entity.MovieGenre;
import com.movieapp.entity.key.MovieGenreId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieGenreRepository extends JpaRepository<MovieGenre, MovieGenreId> {
}
