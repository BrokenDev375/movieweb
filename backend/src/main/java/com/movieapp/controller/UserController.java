package com.movieapp.controller;

import com.movieapp.dto.ChangePasswordDto;
import com.movieapp.dto.UpdateProfileDto;
import com.movieapp.dto.UpdateUserRoleDto;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success(
                userService.searchUsers(username, email, role, PageRequest.of(page, size, sort))
        ));
    }

    @GetMapping("/id/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserInfo(authentication.getName())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<?>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileDto updateProfileDto
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(authentication.getName(), updateProfileDto)));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<?>> changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordDto changePasswordDto
    ) {
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

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleDto updateUserRoleDto
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserRole(id, updateUserRoleDto.role())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
