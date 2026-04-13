package com.movieapp.controller;

import com.movieapp.dto.AuthenticationResultDto;
import com.movieapp.dto.LoginFormDto;
import com.movieapp.dto.RegisterFormDto;
import com.movieapp.entity.User;
import com.movieapp.repository.UserRepository;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody RegisterFormDto registerFormDto) {
        authenticationService.register(registerFormDto);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginFormDto loginFormDto) {
        AuthenticationResultDto result = authenticationService.login(loginFormDto);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> me(Authentication authentication) {
        User user = userRepository.findByUsernameOrEmail(authentication.getName())
                .orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "premiumUntil", user.getPremiumUntil() != null ? user.getPremiumUntil().toString() : ""
        )));
    }
}
