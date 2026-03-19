package com.movieapp.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {

    private int status;
    private String message;
    private T data;

    // Trả về thành công kèm data
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(200).message("Success").data(data).build();
    }

    // Trả về thành công kèm message tuỳ chỉnh
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200).message(message).data(data).build();
    }

    // Trả về sau khi tạo mới thành công
    public static <T> ApiResponse<T> created(T data) {
        return ApiResponse.<T>builder()
                .status(201).message("Created successfully").data(data).build();
    }

    // Trả về khi xoá thành công (không có data)
    public static ApiResponse<Void> noContent(String message) {
        return ApiResponse.<Void>builder()
                .status(200).message(message).data(null).build();
    }

    // Trả về khi có lỗi
    public static ApiResponse<Void> error(int status, String message) {
        return ApiResponse.<Void>builder()
                .status(status).message(message).data(null).build();
    }
}