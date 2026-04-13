package com.example.game36h.repository;

import com.example.game36h.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Optional<Favorite> findByUserIdAndGameId(Long userId, Long gameId);
    Page<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    boolean existsByUserIdAndGameId(Long userId, Long gameId);
}
