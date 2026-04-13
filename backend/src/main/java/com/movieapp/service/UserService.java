package com.movieapp.service;

import com.movieapp.dto.UpdateProfileDto;
import com.movieapp.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    Page<UserDto> searchUsers(String username, String email, String role, Pageable pageable);

    UserDto getUserInfo(String username);

    UserDto getUserById(Long id);

    UserDto updateUserRole(Long id, String role);

    UserDto updateProfile(String username, UpdateProfileDto updateProfileDto);

    void deleteUser(Long id);

    void changePassword(String username, String oldPassword, String newPassword, String confirmPassword);
}
