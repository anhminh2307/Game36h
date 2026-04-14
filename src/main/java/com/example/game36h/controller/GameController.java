package com.example.game36h.controller;

import com.example.game36h.dto.GameRequest;
import com.example.game36h.dto.GameResponse;
import com.example.game36h.service.GameService;
import com.example.game36h.service.UserService;
import com.example.game36h.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Page<GameResponse>> getGames(
            @RequestParam(name = "q", required = false) String keyword,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String sort,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int size) {

        Sort.Direction direction = "desc".equalsIgnoreCase(sort) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sortBy = Sort.by(direction, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sortBy);

        Page<GameResponse> games = gameService.searchGames(keyword, category, pageable);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameResponse> getGame(@PathVariable Long id) {
        GameResponse game = gameService.getGameById(id);
        return ResponseEntity.ok(game);
    }

    @PostMapping
    public ResponseEntity<GameResponse> createGame(
            @Valid @RequestBody GameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        GameResponse game = gameService.createGame(request, userId);
        return ResponseEntity.ok(game);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GameResponse> updateGame(
            @PathVariable Long id,
            @Valid @RequestBody GameRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        GameResponse game = gameService.updateGame(id, request, userId);
        return ResponseEntity.ok(game);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        gameService.deleteGame(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/play")
    public ResponseEntity<Void> startPlay(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        userService.startPlay(userId);
        gameService.incrementViews(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/top")
    public ResponseEntity<Page<GameResponse>> getTopGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<GameResponse> games = gameService.getTopGames(pageable);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/recommend")
    public ResponseEntity<Page<GameResponse>> getRecommendedGames(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        Pageable pageable = PageRequest.of(page, size);
        Page<GameResponse> games = gameService.getRecommendedGames(userId, pageable);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/my-games")
    public ResponseEntity<Page<GameResponse>> getMyGames(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<GameResponse> games = gameService.getGamesByUserId(userId, pageable);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<GameResponse>> getGamesByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<GameResponse> games = gameService.getGamesByUserId(userId, pageable);
        return ResponseEntity.ok(games);
    }

    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new RuntimeException("Invalid user details");
    }
}
