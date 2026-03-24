package com.movieapp.controller;

import com.movieapp.dto.CommentDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.CommentService;

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

    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<?>> addComment(@RequestBody CommentDto commentRequest) {
        // TODO: implement
        Long userId = 1L;
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
        // TODO: implement
        commentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted"));
    }
}
