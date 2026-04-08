package com.movieapp.service.impl;

import com.movieapp.dto.GenreDto;
import com.movieapp.dto.MovieDto;
import com.movieapp.dto.MovieUrlDto;
import com.movieapp.entity.Genre;
import com.movieapp.entity.Movie;
import com.movieapp.entity.MovieUrl;
import com.movieapp.exception.BadRequestException;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.GenreRepository;
import com.movieapp.repository.MovieRepository;
import com.movieapp.repository.MovieUrlRepository;
import com.movieapp.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final MovieUrlRepository movieUrlRepository;

    // =====================================================================
    // CRUD PHIM
    // =====================================================================

    @Override
    public Page<MovieDto> getAllMovies(Pageable pageable) {
        return movieRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    public MovieDto getMovieById(Long id) {
        return toDto(findMovieById(id));
    }

    @Override
    @Transactional
    public MovieDto createMovie(MovieDto dto) {
        Movie movie = Movie.builder()
                .title(dto.getTitle())
                .trailerUrl(dto.getTrailerUrl())
                .posterUrl(dto.getPosterUrl())
                .description(dto.getDescription())
                .nation(dto.getNation())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        if (dto.getGenreIds() != null && !dto.getGenreIds().isEmpty()) {
            movie.setGenres(fetchGenres(dto.getGenreIds()));
        }

        return toDto(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public MovieDto updateMovie(Long id, MovieDto dto) {
        Movie movie = findMovieById(id);

        movie.setTitle(dto.getTitle());
        movie.setTrailerUrl(dto.getTrailerUrl());
        movie.setPosterUrl(dto.getPosterUrl());
        movie.setDescription(dto.getDescription());
        movie.setNation(dto.getNation());
        movie.setUpdatedAt(LocalDateTime.now());

        if (dto.getGenreIds() != null) {
            movie.setGenres(
                    dto.getGenreIds().isEmpty()
                            ? new HashSet<>()
                            : fetchGenres(dto.getGenreIds()));
        }

        return toDto(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        movieRepository.delete(findMovieById(id));
    }

    // =====================================================================
    // TÌM KIẾM / LỌC
    // =====================================================================

    @Override
    public Page<MovieDto> searchMovies(String keyword, Long genreId, String nation, Pageable pageable) {
        if (genreId != null && !genreRepository.existsById(genreId)) {
            throw new ResourceNotFoundException("Genre", genreId);
        }

        Specification<Movie> spec = Specification.where(null);

        if (StringUtils.hasText(keyword)) {
            String normalizedKeyword = keyword.trim().toLowerCase();
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), "%" + normalizedKeyword + "%"));
        }

        if (StringUtils.hasText(nation)) {
            String normalizedNation = nation.trim().toLowerCase();
            spec = spec.and((root, query, cb) ->
                    cb.equal(cb.lower(root.get("nation")), normalizedNation));
        }

        if (genreId != null) {
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                return cb.equal(root.join("genres").get("id"), genreId);
            });
        }

        return movieRepository.findAll(spec, pageable).map(this::toDto);
    }

    // =====================================================================
    // GẮN / GỠ THỂ LOẠI
    // =====================================================================

    @Override
    @Transactional
    public MovieDto addGenreToMovie(Long movieId, Long genreId) {
        Movie movie = findMovieById(movieId);
        Genre genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", genreId));

        movie.getGenres().add(genre);
        return toDto(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public MovieDto removeGenreFromMovie(Long movieId, Long genreId) {
        Movie movie = findMovieById(movieId);

        boolean removed = movie.getGenres().removeIf(g -> g.getId().equals(genreId));
        if (!removed) {
            throw new BadRequestException("Movie does not have genre with id: " + genreId);
        }

        return toDto(movieRepository.save(movie));
    }

    // =====================================================================
    // QUẢN LÝ TẬP PHIM
    // =====================================================================

    @Override
    public List<MovieUrlDto> getEpisodes(Long movieId) {
        findMovieById(movieId); // đảm bảo phim tồn tại
        return movieUrlRepository.findByMovieIdOrderByEpisodeAsc(movieId)
                .stream().map(this::toUrlDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MovieUrlDto addEpisode(Long movieId, MovieUrlDto dto) {
        Movie movie = findMovieById(movieId);

        if (movieUrlRepository.existsByMovieIdAndEpisode(movieId, dto.getEpisode())) {
            throw new BadRequestException("Episode " + dto.getEpisode() + " already exists for this movie");
        }

        MovieUrl episode = MovieUrl.builder()
                .movie(movie)
                .episode(dto.getEpisode())
                .url(dto.getUrl())
                .build();

        return toUrlDto(movieUrlRepository.save(episode));
    }

    @Override
    @Transactional
    public MovieUrlDto updateEpisode(Long movieId, Long episodeId, MovieUrlDto dto) {
        findMovieById(movieId);

        MovieUrl episode = movieUrlRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Episode", episodeId));

        if (!episode.getMovie().getId().equals(movieId)) {
            throw new BadRequestException("Episode does not belong to this movie");
        }

        if (!episode.getEpisode().equals(dto.getEpisode())
                && movieUrlRepository.existsByMovieIdAndEpisode(movieId, dto.getEpisode())) {
            throw new BadRequestException("Episode " + dto.getEpisode() + " already exists for this movie");
        }

        episode.setEpisode(dto.getEpisode());
        episode.setUrl(dto.getUrl());
        return toUrlDto(movieUrlRepository.save(episode));
    }

    @Override
    @Transactional
    public void deleteEpisode(Long movieId, Long episodeId) {
        findMovieById(movieId);

        MovieUrl episode = movieUrlRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Episode", episodeId));

        if (!episode.getMovie().getId().equals(movieId)) {
            throw new BadRequestException("Episode does not belong to this movie");
        }

        movieUrlRepository.delete(episode);
    }

    // =====================================================================
    // HELPER METHODS
    // =====================================================================

    private Movie findMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id));
    }

    private Set<Genre> fetchGenres(List<Long> genreIds) {
        List<Genre> genres = genreRepository.findAllById(genreIds);
        if (genres.size() != genreIds.size()) {
            throw new BadRequestException("One or more genre IDs are invalid");
        }
        return new HashSet<>(genres);
    }

    // Entity → Dto
    private MovieDto toDto(Movie movie) {
        List<GenreDto> genreDtos = movie.getGenres().stream()
                .map(g -> GenreDto.builder().id(g.getId()).name(g.getName()).build())
                .collect(Collectors.toList());

        List<MovieUrlDto> urlDtos = movie.getMovieUrls().stream()
                .map(this::toUrlDto)
                .collect(Collectors.toList());

        return MovieDto.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .trailerUrl(movie.getTrailerUrl())
                .posterUrl(movie.getPosterUrl())
                .description(movie.getDescription())
                .nation(movie.getNation())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .genres(genreDtos)
                .movieUrls(urlDtos)
                .build();
    }

    private MovieUrlDto toUrlDto(MovieUrl url) {
        return MovieUrlDto.builder()
                .id(url.getId())
                .episode(url.getEpisode())
                .url(url.getUrl())
                .build();
    }
}
