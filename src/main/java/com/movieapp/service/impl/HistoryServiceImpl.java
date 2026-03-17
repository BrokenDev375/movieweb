package com.movieapp.service.impl;

import com.movieapp.entity.History;
import com.movieapp.repository.HistoryRepository;
import com.movieapp.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private final HistoryRepository historyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<History> findByUserId(Long userId) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<History> findByUserIdAndMovieId(Long userId, Long movieId) {
        // TODO: implement
        return Optional.empty();
    }

    @Override
    @Transactional
    public History saveOrUpdate(Long userId, Long movieId, Integer watchTime) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // TODO: implement
    }

    @Override
    @Transactional
    public void deleteAllByUserId(Long userId) {
        // TODO: implement
    }
}
