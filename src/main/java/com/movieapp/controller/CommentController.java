package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<?>> addComment(@RequestBody Object commentRequest) {
        // TODO: implement
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(null, "Comment added"));
    }

    @GetMapping("/movies/{id}/comments")
    public ResponseEntity<ApiResponse<?>> getCommentsByMovie(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<?>> updateComment(@PathVariable Long id, @RequestBody Object commentRequest) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<?>> deleteComment(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted"));
    }
}
