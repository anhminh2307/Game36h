package com.example.game36h.service;

import com.example.game36h.dto.CommentRequest;
import com.example.game36h.dto.CommentResponse;
import com.example.game36h.entity.Comment;
import com.example.game36h.entity.Game;
import com.example.game36h.entity.User;
import com.example.game36h.repository.CommentRepository;
import com.example.game36h.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private GameRepository gameRepository;

    public CommentResponse createComment(CommentRequest request, Long userId) {
        Comment comment = new Comment();
        comment.setContent(request.getContent());

        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new RuntimeException("Game not found"));
        comment.setGame(game);

        User user = new User();
        user.setId(userId);
        comment.setUser(user);

        Comment savedComment = commentRepository.save(comment);
        return convertToCommentResponse(savedComment);
    }

    public Page<CommentResponse> getCommentsByGameId(Long gameId, Pageable pageable) {
        // Validate game exists
        gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        return commentRepository.findByGameIdOrderByCreatedAtDesc(gameId, pageable)
                .map(this::convertToCommentResponse);
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    public CommentResponse updateComment(Long commentId, CommentRequest request, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own comments");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);
        return convertToCommentResponse(comment);
    }

    public CommentResponse getCommentById(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        return convertToCommentResponse(comment);
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());

        if (comment.getUser() != null) {
            response.setUser(convertToUserDto(comment.getUser()));
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
