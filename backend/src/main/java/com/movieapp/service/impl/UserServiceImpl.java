package com.movieapp.service.impl;

import com.movieapp.dto.UpdateProfileDto;
import com.movieapp.dto.UserDto;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Page<UserDto> searchUsers(String username, String email, String role, Pageable pageable) {
        Specification<User> spec = Specification.where(null);

        if (StringUtils.hasText(username)) {
            String normalizedUsername = username.trim().toLowerCase();
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("username")), "%" + normalizedUsername + "%"));
        }

        if (StringUtils.hasText(email)) {
            String normalizedEmail = email.trim().toLowerCase();
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("email")), "%" + normalizedEmail + "%"));
        }

        if (StringUtils.hasText(role)) {
            String normalizedRole = normalizeRole(role);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), normalizedRole));
        }

        return userRepository.findAll(spec, pageable).map(this::toDto);
    }

    @Override
    public UserDto getUserInfo(String username) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND.value()));
        return toDto(user);
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND.value()));
        return toDto(user);
    }

    @Override
    public UserDto updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND.value()));
        user.setRole(normalizeRole(role));
        return toDto(userRepository.save(user));
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

    private String normalizeRole(String role) {
        String normalizedRole = role.trim().toUpperCase(Locale.ROOT);
        if (!User.ROLE_USER.equals(normalizedRole) && !User.ROLE_ADMIN.equals(normalizedRole)) {
            throw new AppException("Role must be USER or ADMIN", HttpStatus.BAD_REQUEST.value());
        }
        return normalizedRole;
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
