package com.movieapp.service;

import com.movieapp.dto.HistoryDto;
import com.movieapp.entity.History;

import java.util.List;
import java.util.Optional;

public interface HistoryService {

    List<HistoryDto> findByUserId(Long userId);

    Optional<HistoryDto> findByUserIdAndMovieId(Long userId, Long movieId);

    HistoryDto saveOrUpdate(Long userId, Long movieId, Integer watchTime);

    void delete(Long id);

    void deleteAllByUserId(Long userId);
}
