package com.movieapp.controller;

import com.movieapp.response.ApiResponse;
import com.movieapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getUserById(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateUser(@PathVariable Long id, @RequestBody Object userRequest) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        // TODO: implement
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted"));
    }
}
