package com.movieapp.service;

import com.movieapp.dto.AuthenticationResultDto;
import com.movieapp.dto.LoginFormDto;
import com.movieapp.dto.RegisterFormDto;

public interface AuthenticationService {
    void register(RegisterFormDto registerFormDto);

    AuthenticationResultDto login(LoginFormDto loginFormDto);
}
