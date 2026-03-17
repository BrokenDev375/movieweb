package com.movieapp.service.impl;

import com.movieapp.entity.Comment;
import com.movieapp.repository.CommentRepository;
import com.movieapp.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Comment> findByMovieId(Long movieId) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Comment> findByUserId(Long userId) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Comment> findById(Long id) {
        // TODO: implement
        return Optional.empty();
    }

    @Override
    @Transactional
    public Comment create(Comment comment) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public Comment update(Long id, Comment comment) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // TODO: implement
    }
}
