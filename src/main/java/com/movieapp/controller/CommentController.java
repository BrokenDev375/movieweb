package com.movieapp.controller;

import com.movieapp.dto.CommentDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.CommentService;
import com.movieapp.repository.UserRepository;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import org.springframework.security.core.context.SecurityContextHolder;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<?>> addComment(@RequestBody CommentDto commentRequest) {
        Long userId = getCurrentUserId();
        CommentDto saveCommentDto = commentService.create(userId, commentRequest.getMovieId(),
                commentRequest.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saveCommentDto, "Comment added"));
    }

    @GetMapping("/movies/{id}/comments")
    public ResponseEntity<ApiResponse<?>> getCommentsByMovie(@PathVariable Long id) {
        // TODO: implement
        List<CommentDto> commentDtos = commentService.findByMovieId(id);
        return ResponseEntity.ok(ApiResponse.success(commentDtos));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<?>> updateComment(@PathVariable Long id, @RequestBody CommentDto commentRequest) {
        // TODO: implement
        CommentDto commentDto = commentService.update(commentRequest.getId(), commentRequest.getContent());
        return ResponseEntity.ok(ApiResponse.success(commentDto));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<?>> deleteComment(@PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted"));
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameOrEmail(username)
                .map(User::getId)
                .orElseThrow(() -> new AppException("User not found"));
    }
}
