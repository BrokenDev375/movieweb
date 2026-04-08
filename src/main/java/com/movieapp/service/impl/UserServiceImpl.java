package com.movieapp.service.impl;

import com.movieapp.dto.UpdateProfileDto;
import com.movieapp.dto.UserDto;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public UserDto getUserInfo(String username) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND.value()));
        return toDto(user);
    }

    @Override
    public UserDto updateProfile(String username, UpdateProfileDto updateProfileDto) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND.value()));

        String newEmail = updateProfileDto.email().trim();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new AppException("Email already exists", HttpStatus.BAD_REQUEST.value());
        }

        user.setEmail(newEmail);
        return toDto(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new AppException("User not found", HttpStatus.NOT_FOUND.value());
        }
        userRepository.deleteById(id);
    }

    @Override
    public void changePassword(String username, String oldPassword, String newPassword, String confirmPassword) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND.value()));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException("Old password is incorrect", HttpStatus.BAD_REQUEST.value());
        }
        if (!StringUtils.hasText(newPassword) || !newPassword.equals(confirmPassword)) {
            throw new AppException("New password and confirm password do not match", HttpStatus.BAD_REQUEST.value());
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new AppException("New password must be different from old password", HttpStatus.BAD_REQUEST.value());
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().toLowerCase(Locale.ROOT)
        );
    }
}
