package com.example.game36h.controller;

import com.example.game36h.dto.RatingRequest;
import com.example.game36h.dto.RatingResponse;
import com.example.game36h.service.RatingService;
import com.example.game36h.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingResponse> createRating(
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        RatingResponse rating = ratingService.createRating(request, userId);
        return ResponseEntity.ok(rating);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingResponse> updateRating(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        RatingResponse rating = ratingService.updateRating(id, request, userId);
        return ResponseEntity.ok(rating);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        ratingService.deleteRating(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> getRatingById(@PathVariable Long id) {
        RatingResponse rating = ratingService.getRatingById(id);
        return ResponseEntity.ok(rating);
    }

    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new RuntimeException("Invalid user details");
    }
}

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
class GameRatingController {

    @Autowired
    private RatingService ratingService;

    @GetMapping("/{id}/ratings")
    public ResponseEntity<Map<String, Object>> getGameRatings(@PathVariable Long id) {
        List<RatingResponse> ratings = ratingService.getRatingsByGameId(id);
        Double averageRating = ratingService.getAverageRating(id);
        Long ratingCount = ratingService.getRatingCount(id);

        Map<String, Object> response = new HashMap<>();
        response.put("ratings", ratings);
        response.put("averageRating", averageRating != null ? averageRating : 0.0);
        response.put("ratingCount", ratingCount != null ? ratingCount : 0);

        return ResponseEntity.ok(response);
    }

    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new RuntimeException("Invalid user details");
    }
}
