package com.example.game36h.controller;

import com.example.game36h.dto.PlayStatusDto;
import com.example.game36h.dto.UserDto;
import com.example.game36h.service.UserService;
import com.example.game36h.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromUserDetails(userDetails);
        UserDto user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUser(
            @Valid @RequestBody UserDto userDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        UserDto updatedUser = userService.updateUserProfile(userId, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserProfile(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<UserDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/play-status")
    public ResponseEntity<PlayStatusDto> getPlayStatus(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromUserDetails(userDetails);
        PlayStatusDto status = userService.getPlayStatus(userId);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/me/start-play")
    public ResponseEntity<Void> startPlay(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromUserDetails(userDetails);
        userService.startPlay(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/update-play-time")
    public ResponseEntity<Void> updatePlayTime(
            @RequestParam long minutesPlayed,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        userService.updatePlayTime(userId, minutesPlayed);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new RuntimeException("Invalid user details");
    }
}
