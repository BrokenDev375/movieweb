package com.movieapp.service.impl;

import com.movieapp.dto.ContinueWatchingDto;
import com.movieapp.dto.HistoryDto;
import com.movieapp.entity.History;
import com.movieapp.entity.MovieUrl;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.HistoryRepository;
import com.movieapp.repository.MovieUrlRepository;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private final UserRepository userRepository;
    private final HistoryRepository historyRepository;
    private final MovieUrlRepository movieUrlRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HistoryDto> findByUserId(Long userId) {
        return historyRepository.findByUser_IdOrderByUpdatedAtDesc(userId).stream()
                .map(history -> mapToDto(history))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContinueWatchingDto> getContinueWatching(Long userId) {
        List<History> histories = historyRepository.findByUser_IdOrderByUpdatedAtDesc(userId);
        Map<Long, ContinueWatchingDto> latestByMovie = new LinkedHashMap<>();

        for (History history : histories) {
            Long movieId = history.getMovieUrl().getMovie().getId();
            latestByMovie.putIfAbsent(movieId, mapToContinueWatchingDto(history));
        }

        return new ArrayList<>(latestByMovie.values());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<HistoryDto> findByUserIdAndMovieUrlId(Long userId, Long movieUrlId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        movieUrlRepository.findById(movieUrlId)
                .orElseThrow(() -> new ResourceNotFoundException("MovieUrl", movieUrlId));

        return historyRepository.findByUser_IdAndMovieUrl_Id(userId, movieUrlId)
                .map(history -> mapToDto(history));
    }

    @Override
    @Transactional
    public HistoryDto saveOrUpdate(Long userId, Long movieUrlId, Integer watchTime) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        MovieUrl movieUrl = movieUrlRepository.findById(movieUrlId)
                .orElseThrow(() -> new ResourceNotFoundException("MovieUrl", movieUrlId));

        History history = historyRepository.findByUser_IdAndMovieUrl_Id(userId, movieUrlId)
                .orElseGet(History::new);

        history.setUser(user);
        history.setMovieUrl(movieUrl);
        history.setWatchTime(watchTime);
        history.setUpdatedAt(LocalDateTime.now());

        History savedHistory = historyRepository.save(history);
        return mapToDto(savedHistory);
    }

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        History history = historyRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new AppException("History not found", HttpStatus.NOT_FOUND.value()));
        historyRepository.delete(history);
    }

    @Override
    @Transactional
    public void deleteAllByUserId(Long userId) {
        historyRepository.deleteAllByUser_Id(userId);
    }

    HistoryDto mapToDto(History history) {
        return HistoryDto.builder()
                .id(history.getId())
                .userId(history.getUser().getId())
                .movieUrlId(history.getMovieUrl().getId())
                .movieId(history.getMovieUrl().getMovie().getId())
                .movieTitle(history.getMovieUrl().getMovie().getTitle())
                .moviePosterUrl(history.getMovieUrl().getMovie().getPosterUrl())
                .episode(history.getMovieUrl().getEpisode())
                .watchUrl(history.getMovieUrl().getUrl())
                .updatedAt(history.getUpdatedAt())
                .watchTime(history.getWatchTime())
                .build();
    }

    ContinueWatchingDto mapToContinueWatchingDto(History history) {
        return ContinueWatchingDto.builder()
                .movieId(history.getMovieUrl().getMovie().getId())
                .movieTitle(history.getMovieUrl().getMovie().getTitle())
                .moviePosterUrl(history.getMovieUrl().getMovie().getPosterUrl())
                .movieUrlId(history.getMovieUrl().getId())
                .episode(history.getMovieUrl().getEpisode())
                .watchUrl(history.getMovieUrl().getUrl())
                .watchTime(history.getWatchTime())
                .updatedAt(history.getUpdatedAt())
                .build();
    }
}
