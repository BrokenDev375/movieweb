package com.movieapp.repository;

import com.movieapp.entity.Favorite;
import com.movieapp.entity.key.FavoriteId;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {
    boolean existsByUser_IdAndMovie_Id(Long userId, Long movieId);

    List<Favorite> findByUser_Id(Long UserId);

    void deleteByUser_IdAndMovie_Id(Long UserId, Long MovieId);
}
