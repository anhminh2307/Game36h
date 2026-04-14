package com.example.game36h.controller;

import com.example.game36h.dto.GameResponse;
import com.example.game36h.dto.UserDto;
import com.example.game36h.entity.Game;
import com.example.game36h.service.GameService;
import com.example.game36h.repository.GameRepository;
import com.example.game36h.repository.UserRepository;
import com.example.game36h.entity.User;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameService gameService;

    @Autowired
    private UserRepository userRepository;
    // Lấy danh sách game chờ duyệt
    @GetMapping("/games/pending")
    public ResponseEntity<Page<GameResponse>> getPendingGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Game> games = gameRepository.findByStatus(Game.GameStatus.PENDING, pageable);
        
        // Convert Page<Game> to Page<GameResponse>
        Page<GameResponse> gameResponses = games.map(game -> gameService.convertToGameResponse(game));
        return ResponseEntity.ok(gameResponses);
    }

    // Duyệt game
    @PutMapping("/games/{gameId}/approve")
    public ResponseEntity<GameResponse> approveGame(@PathVariable Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        game.setStatus(Game.GameStatus.APPROVED);
        gameRepository.save(game);
        return ResponseEntity.ok(gameService.getGameById(gameId));
    }

    // Từ chối game
    @PutMapping("/games/{gameId}/reject")
    public ResponseEntity<GameResponse> rejectGame(@PathVariable Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        game.setStatus(Game.GameStatus.REJECTED);
        gameRepository.save(game);
        return ResponseEntity.ok(gameService.getGameById(gameId));
    }

    // Update game status
    @PutMapping("/games/{gameId}/status")
    public ResponseEntity<GameResponse> updateGameStatus(
            @PathVariable Long gameId,
            @RequestParam String status) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        game.setStatus(Game.GameStatus.valueOf(status));
        gameRepository.save(game);
        return ResponseEntity.ok(gameService.getGameById(gameId));
    }

    // Lấy tất cả game (không phân biệt status)
    @GetMapping("/games")
    public ResponseEntity<Page<GameResponse>> getAllGames(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Game> games = gameRepository.findAll(pageable);
        
        // Convert Page<Game> to Page<GameResponse>
        Page<GameResponse> gameResponses = games.map(game -> gameService.convertToGameResponse(game));
        return ResponseEntity.ok(gameResponses);
    }
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            long totalUsers = userRepository.count();
            long totalGames = gameRepository.count();

            long pendingGames = gameRepository.countByStatus(Game.GameStatus.PENDING);
            long approvedGames = gameRepository.countByStatus(Game.GameStatus.APPROVED);

            Map<String, Object> result = new HashMap<>();
            result.put("totalUsers", totalUsers);
            result.put("totalGames", totalGames);
            result.put("pendingGames", pendingGames);
            result.put("approvedGames", approvedGames);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Dashboard error: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    // ================= USERS =================

    // Lấy danh sách user
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findAll(pageable);
        
        // Convert to minimal data to avoid circular references
        Page<Map<String, Object>> userDtos = users.map(user -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", user.getId());
            dto.put("username", user.getUsername());
            dto.put("email", user.getEmail());
            dto.put("role", user.getRole().name());
            dto.put("avatar", user.getAvatar());
            dto.put("isBanned", user.getIsBanned());
            return dto;
        });
        
        return ResponseEntity.ok(userDtos);
    }

    // Xóa user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Đổi role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> changeRole(
            @PathVariable Long id,
            @RequestParam String role) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(User.Role.valueOf(role));
        return ResponseEntity.ok(userRepository.save(user));
    }
    @PutMapping("/users/{id}/ban")
    public ResponseEntity<User> toggleBan(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsBanned(!user.getIsBanned());
        return ResponseEntity.ok(userRepository.save(user));
    }
}