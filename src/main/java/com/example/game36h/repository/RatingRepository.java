package com.example.game36h.repository;

import com.example.game36h.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserIdAndGameId(Long userId, Long gameId);
    
    List<Rating> findByGameId(Long gameId);
    
    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.game.id = :gameId")
    Double getAverageRatingByGameId(@Param("gameId") Long gameId);
    
    @Query("SELECT COUNT(r) FROM Rating r WHERE r.game.id = :gameId")
    Long getRatingCountByGameId(@Param("gameId") Long gameId);
}
