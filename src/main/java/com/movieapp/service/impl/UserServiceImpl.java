package com.movieapp.service.impl;

import com.movieapp.entity.User;
import com.movieapp.repository.UserRepository;
import com.movieapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        // TODO: implement
        return Optional.empty();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        // TODO: implement
        return Optional.empty();
    }

    @Override
    @Transactional
    public User create(User user) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public User update(Long id, User user) {
        // TODO: implement
        return null;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // TODO: implement
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        // TODO: implement
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        // TODO: implement
        return false;
    }
}
