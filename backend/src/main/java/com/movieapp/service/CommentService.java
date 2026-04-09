package com.movieapp.service;

import com.movieapp.dto.CommentDto;
import com.movieapp.entity.Comment;

import java.util.List;
import java.util.Optional;

public interface CommentService {

    List<CommentDto> findByMovieId(Long movieId);

    List<CommentDto> findByUserId(Long userId);

    Optional<CommentDto> findById(Long id);

    CommentDto create(Long userId, Long movieId, String content);

    CommentDto update(Long id, String content);

    void delete(Long id);
}
