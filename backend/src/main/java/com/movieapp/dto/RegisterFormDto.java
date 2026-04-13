package com.movieapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

public record RegisterFormDto(
        @NotBlank(message = "Không được để trống email")
        @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "Không được để trống username")
        @Length(min = 5, message = "Tên tài khoản phải chứa ít nhất 5 kí tự")
        String username,

        @NotBlank(message = "Không được để trống password")
        @Length(min = 8, message = "Mật khẩu phải chứa ít nhất 8 kí tự")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]+$", message = "Mật khẩu phải chứa cả chữ và số")
        String password
) {
}
