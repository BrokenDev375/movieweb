package com.movieapp.service.impl;

import com.movieapp.dto.GenreDto;
import com.movieapp.entity.Genre;
import com.movieapp.exception.BadRequestException;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.GenreRepository;
import com.movieapp.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    public List<GenreDto> getAllGenres() {
        return genreRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public GenreDto getGenreById(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id));
        return toDto(genre);
    }

    @Override
    @Transactional
    public GenreDto createGenre(GenreDto dto) {
        if (genreRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Genre '" + dto.getName() + "' already exists");
        }
        Genre genre = Genre.builder()
                .name(dto.getName())
                .build();
        return toDto(genreRepository.save(genre));
    }

    @Override
    @Transactional
    public GenreDto updateGenre(Long id, GenreDto dto) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id));

        // Kiểm tra tên mới có trùng với genre khác không
        genreRepository.findByNameIgnoreCase(dto.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Genre '" + dto.getName() + "' already exists");
            }
        });

        genre.setName(dto.getName());
        return toDto(genreRepository.save(genre));
    }

    @Override
    @Transactional
    public void deleteGenre(Long id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id));
        genreRepository.delete(genre);
    }

    // ── Helper: Entity → Dto ─────────────────────────────────────────────
    private GenreDto toDto(Genre genre) {
        return GenreDto.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build();
    }
}