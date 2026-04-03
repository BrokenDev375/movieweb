package com.movieapp.service.impl;

import com.movieapp.dto.AuthenticationResultDto;
import com.movieapp.dto.LoginFormDto;
import com.movieapp.dto.RegisterFormDto;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import com.movieapp.repository.UserRepository;
import com.movieapp.security.JwtService;
import com.movieapp.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    @Override
    public void register(RegisterFormDto registerFormDto) {
        if(userRepository.existsByEmail(registerFormDto.email())) {
            throw new AppException("Email đã tồn tại");
        }
        if (userRepository.existsByUsername(registerFormDto.username())) {
            throw new AppException("Username đã tồn tại");
        }

        User newUser = new User();
        newUser.setUsername(registerFormDto.username());
        newUser.setPassword(passwordEncoder.encode(registerFormDto.password()));
        newUser.setRole(User.ROLE_USER);
        newUser.setEmail(registerFormDto.email());
        newUser.setCreatedAt(LocalDateTime.now());
        userRepository.save(newUser);
    }

    @Override
    public AuthenticationResultDto login(LoginFormDto loginFormDto) {
        var user = userRepository.findByUsernameOrEmail(loginFormDto.username()).orElseThrow(
                () -> new AppException("Tên tên khoản hoặc mật khẩu không tồn tại")
        );
        if (!passwordEncoder.matches(loginFormDto.password(), user.getPassword())) {
            throw new AppException("Tên tài khoản hoặc mật khẩu không tồn tại");
        }

        String token = jwtService.createToken(user.getUsername());
        return new AuthenticationResultDto(
                token
        );
    }
}
