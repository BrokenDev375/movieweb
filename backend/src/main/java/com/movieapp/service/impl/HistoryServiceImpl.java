package com.movieapp.service.impl;

import com.movieapp.dto.CommentDto;
import com.movieapp.dto.HistoryDto;
import com.movieapp.entity.History;
import com.movieapp.entity.Movie;
import com.movieapp.entity.User;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.HistoryRepository;
import com.movieapp.repository.MovieRepository;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HistoryDto> findByUserId(Long userId) {
        // TODO: implement
        return historyRepository.findByUser_Id(userId).stream()
                .map(history -> mapToDto(history))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HistoryDto> findByUserIdAndMovieId(Long userId, Long movieId) {
        // TODO: implement
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", movieId));
        return historyRepository.findByUser_IdAndMovie_id(movieId, userId)
                .map(history -> mapToDto(history));
    }

    @Override
    @Transactional
    public HistoryDto saveOrUpdate(Long userId, Long movieId, Integer watchTime) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", movieId));

        History history = historyRepository.findByUser_IdAndMovie_id(userId, movieId)
                .orElseGet(History::new);

        history.setUser(user);
        history.setMovie(movie);
        history.setWatchTime(watchTime);
        history.setUpdatedAt(LocalDateTime.now());

        History savedHistory = historyRepository.save(history);
        return mapToDto(savedHistory);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // TODO: implement
        historyRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteAllByUserId(Long userId) {
        // TODO: implement
        historyRepository.deleteAllByUserId(userId);
    }

    HistoryDto mapToDto(History history) {
        return HistoryDto.builder()
                .id(history.getId())
                .userId(history.getUser().getId())
                .movieId(history.getMovie().getId())
                .updatedAt(history.getUpdatedAt())
                .watchTime(history.getWatchTime())
                .build();
    }
}
