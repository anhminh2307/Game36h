package com.example.game36h.controller;

import com.example.game36h.dto.CommentRequest;
import com.example.game36h.dto.CommentResponse;
import com.example.game36h.service.CommentService;
import com.example.game36h.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        CommentResponse comment = commentService.createComment(request, userId);
        return ResponseEntity.ok(comment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        CommentResponse comment = commentService.updateComment(id, request, userId);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        Long userId = getUserIdFromUserDetails(userDetails);
        commentService.deleteComment(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentResponse> getCommentById(@PathVariable Long id) {
        CommentResponse comment = commentService.getCommentById(id);
        return ResponseEntity.ok(comment);
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
class GameCommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<CommentResponse>> getGameComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CommentResponse> comments = commentService.getCommentsByGameId(id, pageable);
        return ResponseEntity.ok(comments);
    }
}
