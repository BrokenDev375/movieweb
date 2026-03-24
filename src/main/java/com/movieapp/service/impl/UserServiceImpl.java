package com.movieapp.service.impl;

import com.movieapp.dto.UserDto;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getAllUsers() {
        var users = userRepository.findAll();
        return users.stream().map(u -> new UserDto(
           u.getId(),
           u.getUsername(),
           u.getEmail(),
           u.getRole().toLowerCase(Locale.ROOT)
        )).toList();
    }

    @Override
    public UserDto getUserInfo(String username) {
        var user = userRepository.findByUsernameOrEmail(username).orElseThrow(
                () -> new AppException("Người dùng không tồn tại")
        );
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().toLowerCase(Locale.ROOT)
        );
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new AppException("Người dùng không tồn tại");
        userRepository.deleteById(id);
    }

    @Override
    public void changePassword(String username, String oldPassword, String newPassword) {
        var user = userRepository.findByUsernameOrEmail(username).orElseThrow(
                () -> new AppException("Người dùng không tồn tại")
        );

        if(!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException("Mật khẩu cũ không khớp");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
