package com.movieapp.service;

import com.movieapp.entity.Genre;

import java.util.List;
import java.util.Optional;

public interface GenreService {

    List<Genre> findAll();

    Optional<Genre> findById(Long id);

    Genre create(Genre genre);

    Genre update(Long id, Genre genre);

    void delete(Long id);
}
