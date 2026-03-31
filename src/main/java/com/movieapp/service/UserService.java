package com.movieapp.service;

import com.movieapp.dto.UserDto;
import com.movieapp.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<UserDto> getAllUsers();

    UserDto getUserInfo(String username);

    void deleteUser(Long id);

    void changePassword(String username, String oldPassword, String newPassword);
}