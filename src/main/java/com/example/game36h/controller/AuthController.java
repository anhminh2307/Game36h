package com.example.game36h.controller;

import com.example.game36h.dto.AuthRequest;
import com.example.game36h.dto.AuthResponse;
import com.example.game36h.service.AuthService;
import com.example.game36h.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @RequestBody Map<String, String> passwords,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");
        
        if (currentPassword == null || newPassword == null) {
            throw new RuntimeException("Current password and new password are required");
        }
        
        Long userId = getUserIdFromUserDetails(userDetails);
        authService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        authService.forgotPassword(email);
        
        // Always return success message regardless of whether email exists (security)
        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset link has been sent."));
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<Map<String, Boolean>> validateResetToken(@RequestParam String token) {
        boolean valid = authService.validateResetToken(token);
        return ResponseEntity.ok(Map.of("valid", valid));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Token is required");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new RuntimeException("New password is required");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        
        authService.resetPassword(token, newPassword);
        
        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
    }

    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new RuntimeException("Invalid user details");
    }
}
