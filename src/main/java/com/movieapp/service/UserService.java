package com.movieapp.service;

import com.movieapp.dto.UpdateProfileDto;
import com.movieapp.dto.UserDto;

import java.util.List;

public interface UserService {

    List<UserDto> getAllUsers();

    UserDto getUserInfo(String username);

    UserDto updateProfile(String username, UpdateProfileDto updateProfileDto);

    void deleteUser(Long id);

    void changePassword(String username, String oldPassword, String newPassword, String confirmPassword);
}
