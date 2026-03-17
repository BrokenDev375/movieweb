package com.movieapp.service.impl;

import com.movieapp.entity.Movie;
import com.movieapp.repository.MovieRepository;
import com.movieapp.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Movie> findAll() {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Movie> findById(Long id) {
        // TODO: implement
        return Optional.empty();
    }

    @Override
    @Transactional
    public Movie create(Movie movie) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public Movie update(Long id, Movie movie) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // TODO: implement
    }

    @Override
    @Transactional(readOnly = true)
    public List<Movie> searchByTitle(String title) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Movie> findByNation(String nation) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Movie> findByGenreId(Long genreId) {
        // TODO: implement
        return null;
    }
}
