package com.example.game36h.repository;

import com.example.game36h.entity.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    
    @Query("""
        SELECT g FROM Game g
        WHERE (:keyword IS NULL OR g.title LIKE %:keyword%)
        AND (:categoryId IS NULL OR g.category.id = :categoryId)
        AND g.status = 'APPROVED'
        """)
    Page<Game> searchGames(@Param("keyword") String keyword, 
                          @Param("categoryId") Long categoryId, 
                          Pageable pageable);
    
    Page<Game> findByStatus(Game.GameStatus status, Pageable pageable);
    
    Page<Game> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT g FROM Game g WHERE g.status = 'APPROVED' ORDER BY g.views DESC")
    Page<Game> findTopGames(Pageable pageable);
    
    @Query("SELECT g FROM Game g WHERE g.status = 'APPROVED' ORDER BY g.createdAt DESC")
    Page<Game> findNewestGames(Pageable pageable);
    
    @Query("""
        SELECT g FROM Game g 
        WHERE g.status = 'APPROVED' 
        AND g.id IN (
            SELECT h.game.id FROM History h WHERE h.user.id = :userId
            UNION
            SELECT f.game.id FROM Favorite f WHERE f.user.id = :userId
        )
        """)
    Page<Game> findRecommendedGames(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(g) FROM Game g WHERE g.status = :status")
    long countByStatus(@Param("status") Game.GameStatus status);
}