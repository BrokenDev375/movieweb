package com.movieapp.service.impl;

import com.movieapp.entity.Genre;
import com.movieapp.repository.GenreRepository;
import com.movieapp.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Genre> findAll() {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Genre> findById(Long id) {
        // TODO: implement
        return Optional.empty();
    }

    @Override
    @Transactional
    public Genre create(Genre genre) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public Genre update(Long id, Genre genre) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // TODO: implement
    }
}
