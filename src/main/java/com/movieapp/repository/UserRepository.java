package com.movieapp.repository;

import com.movieapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.username = :id OR u.email = :id")
    Optional<User> findByUsernameOrEmail(@Param("id") String identifier);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
