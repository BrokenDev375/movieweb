package com.movieapp.service;

import com.movieapp.dto.GenreDto;

import java.util.List;

public interface GenreService {

    List<GenreDto> getAllGenres(); // lấy tất cả thể loại

    GenreDto getGenreById(Long id); // lấy 1 thể loại theo ID

    GenreDto createGenre(GenreDto dto); // tạo thể loại mới

    GenreDto updateGenre(Long id, GenreDto dto); // sửa thể loại

    void deleteGenre(Long id); // xoá thể loại
}