package com.movieapp.repository;

import com.movieapp.entity.History;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    List<History> findByUser_Id(Long id);

    Optional<History> findByUser_IdAndMovie_id(Long userId, Long movieId);

    void deleteByUser_Id(Long UserId);

    boolean existsByUser_IdAndMovie_Id(Long UserId, Long movieId);

    void deleteAllByUserId(Long id);
}
