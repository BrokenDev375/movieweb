package com.movieapp.controller;

import com.movieapp.exception.AppException;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        var users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<?>> getUserInfo(@PathVariable String username) {
        var userDetails = (UserDetails)SecurityContextHolder.getContext().getAuthentication().getDetails();
        String requestedUser = userDetails.getUsername();
        boolean isAdmin = userDetails.getAuthorities().contains("ROLE_ADMIN");

        // Chỉ chính chủ hoặc admin mới có thể xem thông tin tài khoản
        if(requestedUser.equals(username) || isAdmin) {
            var user = userService.getUserInfo(username);
            return ResponseEntity.ok(ApiResponse.success(user));
        } else {
            throw new AccessDeniedException("Không có quyền lấy thông tin người dùng này");
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
