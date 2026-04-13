package com.movieapp.service;

import com.movieapp.dto.MovieDto;
import com.movieapp.dto.MovieUrlDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MovieService {

    // CRUD movie
    Page<MovieDto> getAllMovies(Pageable pageable);

    MovieDto getMovieById(Long id);

    MovieDto createMovie(MovieDto dto);

    MovieDto updateMovie(Long id, MovieDto dto);

    void deleteMovie(Long id);

    // Search / filter
    Page<MovieDto> searchMovies(String keyword, Long genreId, String nation, Pageable pageable);

    // Genre assignment
    MovieDto addGenreToMovie(Long movieId, Long genreId);

    MovieDto removeGenreFromMovie(Long movieId, Long genreId);

    // Episode management
    List<MovieUrlDto> getEpisodes(Long movieId);

    MovieUrlDto addEpisode(Long movieId, MovieUrlDto dto);

    MovieUrlDto updateEpisode(Long movieId, Long episodeId, MovieUrlDto dto);

    void deleteEpisode(Long movieId, Long episodeId);
}
