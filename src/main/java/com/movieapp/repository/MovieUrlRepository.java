package com.movieapp.repository;

import com.movieapp.entity.MovieUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieUrlRepository extends JpaRepository<MovieUrl, Long> {
}
