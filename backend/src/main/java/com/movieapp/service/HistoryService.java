package com.movieapp.service;

import com.movieapp.dto.ContinueWatchingDto;
import com.movieapp.dto.HistoryDto;

import java.util.List;
import java.util.Optional;

public interface HistoryService {

    List<HistoryDto> findByUserId(Long userId);

    List<ContinueWatchingDto> getContinueWatching(Long userId);

    Optional<HistoryDto> findByUserIdAndMovieUrlId(Long userId, Long movieUrlId);

    HistoryDto saveOrUpdate(Long userId, Long movieUrlId, Integer watchTime);

    void delete(Long userId, Long id);

    void deleteAllByUserId(Long userId);
}
