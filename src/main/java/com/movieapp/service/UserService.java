package com.movieapp.service;

import com.movieapp.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<User> findAll();

    Optional<User> findById(Long id);

    Optional<User> findByUsername(String username);

    User create(User user);

    User update(Long id, User user);

    void delete(Long id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
