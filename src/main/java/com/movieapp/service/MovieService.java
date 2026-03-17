package com.movieapp.service;

import com.movieapp.entity.Movie;

import java.util.List;
import java.util.Optional;

public interface MovieService {

    List<Movie> findAll();

    Optional<Movie> findById(Long id);

    Movie create(Movie movie);

    Movie update(Long id, Movie movie);

    void delete(Long id);

    List<Movie> searchByTitle(String title);

    List<Movie> findByNation(String nation);

    List<Movie> findByGenreId(Long genreId);
}
