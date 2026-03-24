package com.movieapp.repository;

import com.movieapp.entity.Comment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByUser_Id(Long UserId);

    List<Comment> findByMovie_Id(Long MovieId);
}
