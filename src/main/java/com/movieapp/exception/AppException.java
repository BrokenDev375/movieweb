package com.movieapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AppException extends RuntimeException {

    private final int statusCode;

    public AppException(String message) {
        super(message);
        this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
    }

    public AppException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public AppException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value();
    }

    public int getStatusCode() {
        return statusCode;
    }
}
