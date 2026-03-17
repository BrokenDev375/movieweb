package com.movieapp.service;

import com.movieapp.entity.History;

import java.util.List;
import java.util.Optional;

public interface HistoryService {

    List<History> findByUserId(Long userId);

    Optional<History> findByUserIdAndMovieId(Long userId, Long movieId);

    History saveOrUpdate(Long userId, Long movieId, Integer watchTime);

    void delete(Long id);

    void deleteAllByUserId(Long userId);
}
