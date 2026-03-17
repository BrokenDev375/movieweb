package com.movieapp.repository;

import com.movieapp.entity.Favorite;
import com.movieapp.entity.key.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
}
