package com.example.game36h.controller;

import com.example.game36h.dto.ForumCommentRequest;
import com.example.game36h.dto.ForumPostRequest;
import com.example.game36h.dto.ForumPostResponse;
import com.example.game36h.dto.ForumCommentResponse;
import com.example.game36h.service.ForumService;
import com.example.game36h.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ForumController {

    @Autowired
    private ForumService forumService;

    @GetMapping("/posts")
    public ResponseEntity<List<ForumPostResponse>> getPosts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(forumService.getPosts(search, title, sort));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<ForumPostResponse> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getPostById(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<ForumPostResponse> createPost(
            @Valid @RequestBody ForumPostRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(forumService.createPost(request, userId));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<ForumPostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody ForumPostRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        boolean admin = isAdmin(userDetails);
        return ResponseEntity.ok(forumService.updatePost(id, request, userId, admin));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        boolean admin = isAdmin(userDetails);
        forumService.deletePost(id, userId, admin);
        return ResponseEntity.noContent().build();
    }
    
    private Long getUserId(UserDetails userDetails) {
        if (userDetails instanceof UserPrincipal) {
            return ((UserPrincipal) userDetails).getId();
        }
        throw new RuntimeException("Invalid user details");
    }

@PostMapping("/posts/{id}/like")
    public ResponseEntity<ForumPostResponse> likePost(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.likePost(id));
    }

    @PostMapping("/posts/{id}/dislike")
    public ResponseEntity<ForumPostResponse> dislikePost(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.dislikePost(id));
    }
    private boolean isAdmin(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
}
