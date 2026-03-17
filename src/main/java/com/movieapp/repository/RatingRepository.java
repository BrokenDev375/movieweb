package com.movieapp.repository;

import com.movieapp.entity.Rating;
import com.movieapp.entity.key.RatingId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, RatingId> {
}
