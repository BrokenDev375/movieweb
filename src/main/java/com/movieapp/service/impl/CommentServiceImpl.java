package com.movieapp.service.impl;

import com.movieapp.dto.CommentDto;
import com.movieapp.entity.Comment;
import com.movieapp.entity.Movie;
import com.movieapp.entity.User;
import com.movieapp.exception.ResourceNotFoundException;
import com.movieapp.repository.CommentRepository;
import com.movieapp.repository.MovieRepository;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CommentDto> findByMovieId(Long movieId) {
        // TODO: implement
        return commentRepository.findByMovie_Id(movieId).stream()
                .map(comment -> mapToDto(comment))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentDto> findByUserId(Long userId) {
        // TODO: implement
        return commentRepository.findByUser_Id(userId).stream()
                .map(comment -> mapToDto(comment))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CommentDto> findById(Long id) {
        return commentRepository.findById(id)
                .map(comment -> mapToDto(comment));
    }

    @Override
    @Transactional
    public CommentDto create(Long UserId, Long MovieId, String content) {
        User user = userRepository.findById(UserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", UserId));
        Movie movie = movieRepository.findById(MovieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", MovieId));
        Comment comment = Comment.builder()
                .user(user)
                .movie(movie)
                .content(content)
                .createdAt(LocalDateTime.ofInstant(
                        Instant.ofEpochMilli(System.currentTimeMillis()),
                        ZoneId.systemDefault()))
                .build();
        commentRepository.save(comment);
        return mapToDto(comment);
    }

    @Override
    @Transactional
    public CommentDto update(Long id, String Content) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", id));
        comment.setContent(Content);
        Comment updatedComment = commentRepository.save(comment);
        return mapToDto(updatedComment);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", id));
        commentRepository.delete(comment);
    }

    CommentDto mapToDto(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .movieId(comment.getMovie().getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
