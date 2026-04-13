package com.example.game36h.service;

import com.example.game36h.dto.FavoriteDto;
import com.example.game36h.entity.Favorite;
import com.example.game36h.entity.Game;
import com.example.game36h.entity.User;
import com.example.game36h.repository.FavoriteRepository;
import com.example.game36h.repository.GameRepository;
import com.example.game36h.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private RatingRepository ratingRepository;

    public Favorite toggleFavorite(Long gameId, Long userId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndGameId(userId, gameId)) {
            // Remove from favorites
            Favorite favorite = favoriteRepository.findByUserIdAndGameId(userId, gameId)
                    .orElseThrow(() -> new RuntimeException("Favorite not found"));
            favoriteRepository.delete(favorite);
            return null; // Indicates unfavorite
        } else {
            // Add to favorites
            Favorite favorite = new Favorite();
            
            User user = new User();
            user.setId(userId);
            favorite.setUser(user);
            
            favorite.setGame(game);
            
            return favoriteRepository.save(favorite);
        }
    }

    public Page<Favorite> getUserFavorites(Long userId, Pageable pageable) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Favorite getFavoriteById(Long id) {
        return favoriteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Favorite not found with id: " + id));
    }

    public void deleteFavoriteById(Long id) {
        Favorite favorite = favoriteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Favorite not found with id: " + id));
        favoriteRepository.delete(favorite);
    }

    public Page<FavoriteDto> getUserFavoritesDto(Long userId, Pageable pageable) {
        Page<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return favorites.map(this::convertToDto);
    }

    private FavoriteDto convertToDto(Favorite favorite) {
        FavoriteDto dto = new FavoriteDto();
        dto.setId(favorite.getId());
        dto.setCreatedAt(favorite.getCreatedAt());
        
        if (favorite.getGame() != null) {
            Game game = favorite.getGame();
            dto.setGameId(game.getId());
            dto.setGameTitle(game.getTitle());
            dto.setGameThumbnail(game.getThumbnail());
            dto.setGameUrl(game.getGameUrl());
            dto.setViews(game.getViews());
            
            // Get average rating
            Double avgRating = ratingRepository.getAverageRatingByGameId(game.getId());
            dto.setAverageRating(avgRating != null ? avgRating : 0.0);
        }
        
        return dto;
    }
}
