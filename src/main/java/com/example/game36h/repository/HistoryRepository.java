package com.example.game36h.repository;

import com.example.game36h.entity.History;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoryRepository extends JpaRepository<History, Long> {
    Page<History> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);
}
