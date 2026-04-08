package com.movieapp.controller;

import com.movieapp.dto.ChangePasswordDto;
import com.movieapp.dto.UpdateProfileDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserInfo(authentication.getName())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<?>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileDto updateProfileDto) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(authentication.getName(), updateProfileDto)));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<?>> changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordDto changePasswordDto) {
        userService.changePassword(
                authentication.getName(),
                changePasswordDto.oldPassword(),
                changePasswordDto.newPassword(),
                changePasswordDto.confirmPassword()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @GetMapping("/{username}")
    @PreAuthorize("#username == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUserInfo(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserInfo(username)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
