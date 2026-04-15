package com.example.game36h.service;

import com.example.game36h.dto.RatingRequest;
import com.example.game36h.dto.RatingResponse;
import com.example.game36h.entity.Rating;
import com.example.game36h.entity.Game;
import com.example.game36h.entity.User;
import com.example.game36h.repository.RatingRepository;
import com.example.game36h.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private GameRepository gameRepository;

    public RatingResponse createRating(RatingRequest request, Long userId) {
        // Validate game exists
        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found"));

        // Check if user already rated this game
        Optional<Rating> existingRating = ratingRepository.findByUserIdAndGameId(userId, request.getGameId());
        Rating rating;
        
        if (existingRating.isPresent()) {
            // Update existing rating
            rating = existingRating.get();
            rating.setScore(request.getScore());
            rating = ratingRepository.save(rating);
        } else {
            // Create new rating
            rating = new Rating();
            rating.setScore(request.getScore());

            User user = new User();
            user.setId(userId);
            rating.setUser(user);

            rating.setGame(game);
            rating = ratingRepository.save(rating);
        }

        return convertToRatingResponse(rating);
    }

    public List<RatingResponse> getRatingsByGameId(Long gameId) {
        // Validate game exists
        gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        return ratingRepository.findByGameId(gameId).stream()
                .map(this::convertToRatingResponse)
                .collect(Collectors.toList());
    }

    public Double getAverageRating(Long gameId) {
        return ratingRepository.getAverageRatingByGameId(gameId);
    }

    public Long getRatingCount(Long gameId) {
        return ratingRepository.getRatingCountByGameId(gameId);
    }

    public RatingResponse updateRating(Long ratingId, RatingRequest request, Long userId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        if (!rating.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own ratings");
        }

        rating.setScore(request.getScore());
        rating = ratingRepository.save(rating);
        return convertToRatingResponse(rating);
    }

    public void deleteRating(Long ratingId, Long userId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));

        if (!rating.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own ratings");
        }

        ratingRepository.delete(rating);
    }

    public RatingResponse getRatingById(Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new RuntimeException("Rating not found"));
        return convertToRatingResponse(rating);
    }

    private RatingResponse convertToRatingResponse(Rating rating) {
        RatingResponse response = new RatingResponse();
        response.setId(rating.getId());
        response.setScore(rating.getScore());
        response.setCreatedAt(rating.getCreatedAt());

        if (rating.getUser() != null) {
            response.setUser(convertToUserDto(rating.getUser()));
        }

        return response;
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
