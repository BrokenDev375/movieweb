package com.movieapp.service.impl;

import com.movieapp.dto.DashboardSummaryDto;
import com.movieapp.repository.CommentRepository;
import com.movieapp.repository.FavoriteRepository;
import com.movieapp.repository.GenreRepository;
import com.movieapp.repository.HistoryRepository;
import com.movieapp.repository.MovieRepository;
import com.movieapp.repository.RatingRepository;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final CommentRepository commentRepository;
    private final RatingRepository ratingRepository;
    private final FavoriteRepository favoriteRepository;
    private final HistoryRepository historyRepository;

    @Override
    public DashboardSummaryDto getDashboardSummary(int topLimit) {
        int safeTopLimit = Math.max(1, Math.min(topLimit, 20));
        Pageable topPage = PageRequest.of(0, safeTopLimit);

        return DashboardSummaryDto.builder()
                .totalUsers(userRepository.count())
                .totalMovies(movieRepository.count())
                .totalGenres(genreRepository.count())
                .totalComments(commentRepository.count())
                .totalRatings(ratingRepository.count())
                .totalFavorites(favoriteRepository.count())
                .totalHistories(historyRepository.count())
                .topFavoriteMovies(favoriteRepository.findTopFavoriteMovies(topPage))
                .topRatedMovies(ratingRepository.findTopRatedMovies(topPage))
                .topWatchedMovies(historyRepository.findTopWatchedMovies(topPage))
                .build();
    }
}
