package com.movieapp.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private LocalDateTime timestamp;
    private int status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .timestamp(LocalDateTime.now())
                .status(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Success");
    }

    public static ApiResponse<Void> success() {

        return ApiResponse.<Void>builder()
                .timestamp(LocalDateTime.now())
                .status(200)
                .message("Success")
                .data(null)
                .build();
    }

    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .timestamp(LocalDateTime.now())
                .status(201)
                .message("Created successfully")
                .data(data)
                .build();
    }

    public static ApiResponse<Void> message(String message) {
        return ApiResponse.<Void>builder()
                .timestamp(LocalDateTime.now())
                .status(200)
                .message(message)
                .data(null)
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .message(message)
                .data(null)
                .build();
    }
}