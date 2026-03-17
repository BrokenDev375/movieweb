package com.movieapp.service;

import com.movieapp.entity.Comment;

import java.util.List;
import java.util.Optional;

public interface CommentService {

    List<Comment> findByMovieId(Long movieId);

    List<Comment> findByUserId(Long userId);

    Optional<Comment> findById(Long id);

    Comment create(Comment comment);

    Comment update(Long id, Comment comment);

    void delete(Long id);
}
