package com.example.game36h.service;

import com.example.game36h.dto.GameRequest;
import com.example.game36h.dto.GameResponse;
import com.example.game36h.entity.Game;
import com.example.game36h.entity.Category;
import com.example.game36h.entity.User;
import com.example.game36h.repository.GameRepository;
import com.example.game36h.repository.CategoryRepository;
import com.example.game36h.repository.RatingRepository;
import com.example.game36h.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RatingRepository ratingRepository;

    public Page<GameResponse> searchGames(String keyword, Long categoryId, Pageable pageable) {
        return gameRepository.searchGames(keyword, categoryId, pageable)
                .map(this::convertToGameResponse);
    }

    public GameResponse getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        return convertToGameResponse(game);
    }

    public GameResponse createGame(GameRequest request, Long userId) {
        Game game = new Game();
        game.setTitle(request.getTitle());
        game.setDescription(request.getDescription());
        game.setThumbnail(request.getThumbnail());
        game.setGameUrl(request.getGameUrl());
        game.setStatus(Game.GameStatus.PENDING);
        game.setViews(0L);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        game.setCategory(category);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        game.setUser(user);

        Game savedGame = gameRepository.save(game);
        return convertToGameResponse(savedGame);
    }

    public GameResponse updateGame(Long id, GameRequest request, Long userId) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (!game.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own games");
        }

        game.setTitle(request.getTitle());
        game.setDescription(request.getDescription());
        game.setThumbnail(request.getThumbnail());
        game.setGameUrl(request.getGameUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            game.setCategory(category);
        }

        Game savedGame = gameRepository.save(game);
        return convertToGameResponse(savedGame);
    }

    public void deleteGame(Long id, Long userId) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (!game.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own games");
        }

        gameRepository.delete(game);
    }

    public void incrementViews(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        game.setViews(game.getViews() + 1);
        gameRepository.save(game);
    }

    public Page<GameResponse> getTopGames(Pageable pageable) {
        return gameRepository.findTopGames(pageable)
                .map(this::convertToGameResponse);
    }

    public Page<GameResponse> getRecommendedGames(Long userId, Pageable pageable) {
        return gameRepository.findRecommendedGames(userId, pageable)
                .map(this::convertToGameResponse);
    }

    public Page<GameResponse> getGamesByUserId(Long userId, Pageable pageable) {
        return gameRepository.findByUserId(userId, pageable)
                .map(this::convertToGameResponse);
    }

    public GameResponse convertToGameResponse(Game game) {
        GameResponse response = new GameResponse();
        response.setId(game.getId());
        response.setTitle(game.getTitle());
        response.setDescription(game.getDescription());
        response.setThumbnail(game.getThumbnail());
        response.setGameUrl(game.getGameUrl());
        response.setStatus(game.getStatus().name());
        response.setViews(game.getViews());
        response.setCreatedAt(game.getCreatedAt());

        // Category
        if (game.getCategory() != null) {
            response.setCategory(convertToCategoryDto(game.getCategory()));
        }

        // User
        if (game.getUser() != null) {
            response.setUser(convertToUserDto(game.getUser()));
        }

        // Average rating
        Double avgRating = ratingRepository.getAverageRatingByGameId(game.getId());
        response.setAverageRating(avgRating != null ? avgRating : 0.0);

        return response;
    }

    private com.example.game36h.dto.CategoryDto convertToCategoryDto(Category category) {
        com.example.game36h.dto.CategoryDto dto = new com.example.game36h.dto.CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        return dto;
    }

    private com.example.game36h.dto.UserDto convertToUserDto(User user) {
        com.example.game36h.dto.UserDto dto = new com.example.game36h.dto.UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setAvatar(user.getAvatar());
        return dto;
    }
}