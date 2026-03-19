package com.movieapp.service;

import com.movieapp.dto.MovieDto;
import com.movieapp.dto.MovieUrlDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MovieService {

    // --- CRUD phim ---
    Page<MovieDto> getAllMovies(Pageable pageable);

    MovieDto getMovieById(Long id);

    MovieDto createMovie(MovieDto dto);

    MovieDto updateMovie(Long id, MovieDto dto);

    void deleteMovie(Long id);

    // --- Tìm kiếm / lọc ---
    Page<MovieDto> searchByTitle(String title, Pageable pageable);

    Page<MovieDto> filterByNation(String nation, Pageable pageable);

    Page<MovieDto> filterByGenre(Long genreId, Pageable pageable);

    // --- Gắn / gỡ thể loại ---
    MovieDto addGenreToMovie(Long movieId, Long genreId);

    MovieDto removeGenreFromMovie(Long movieId, Long genreId);

    // --- Quản lý tập phim ---
    List<MovieUrlDto> getEpisodes(Long movieId);

    MovieUrlDto addEpisode(Long movieId, MovieUrlDto dto);

    MovieUrlDto updateEpisode(Long movieId, Long episodeId, MovieUrlDto dto);

    void deleteEpisode(Long movieId, Long episodeId);
}