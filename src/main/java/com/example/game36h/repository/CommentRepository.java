package com.example.game36h.repository;

import com.example.game36h.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByGameIdOrderByCreatedAtDesc(Long gameId, Pageable pageable);
    Page<Comment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
