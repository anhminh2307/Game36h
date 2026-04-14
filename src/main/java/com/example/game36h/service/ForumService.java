package com.example.game36h.service;

import com.example.game36h.dto.ForumCommentRequest;
import com.example.game36h.dto.ForumCommentResponse;
import com.example.game36h.dto.ForumPostRequest;
import com.example.game36h.dto.ForumPostResponse;
import com.example.game36h.dto.ForumReportResponse;
import com.example.game36h.entity.ForumComment;
import com.example.game36h.entity.ForumPost;
import com.example.game36h.entity.User;
import com.example.game36h.repository.ForumCommentRepository;
import com.example.game36h.repository.ForumPostRepository;
import com.example.game36h.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ForumService {

    @Autowired
    private ForumPostRepository forumPostRepository;

    @Autowired
    private ForumCommentRepository forumCommentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ForumPostResponse> getPosts(String search, String titleFilter, String sortBy) {
        List<ForumPost> posts = forumPostRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        if (search != null && !search.isBlank()) {
            String normalized = search.trim().toLowerCase();
            posts = posts.stream()
                    .filter(post -> post.getTitle().toLowerCase().contains(normalized)
                            || post.getBody().toLowerCase().contains(normalized)
                            || post.getUser().getUsername().toLowerCase().contains(normalized))
                    .collect(Collectors.toList());
        }

        if (titleFilter != null && !titleFilter.isBlank()) {
            String normalized = titleFilter.trim().toLowerCase();
            posts = posts.stream()
                    .filter(post -> post.getTitle().toLowerCase().contains(normalized))
                    .collect(Collectors.toList());
        }

        switch (sortBy) {
            case "popular":
                posts.sort(Comparator.comparingInt(post -> post.getLikes() - post.getDislikes()));
                break;
            case "comments":
                posts.sort(Comparator.comparingInt(post -> post.getComments().size()));
                break;
            case "controversial":
                posts.sort(Comparator.comparingInt(ForumPost::getDislikes));
                break;
            case "newest":
            default:
                posts.sort(Comparator.comparing(ForumPost::getCreatedAt).reversed());
                break;
        }

        if ("popular".equals(sortBy) || "comments".equals(sortBy) || "controversial".equals(sortBy)) {
            posts = posts.stream()
                    .sorted((a, b) -> {
                        switch (sortBy) {
                            case "popular":
                                return Integer.compare((b.getLikes() - b.getDislikes()), (a.getLikes() - a.getDislikes()));
                            case "comments":
                                return Integer.compare(b.getComments().size(), a.getComments().size());
                            case "controversial":
                                return Integer.compare(b.getDislikes(), a.getDislikes());
                            default:
                                return 0;
                        }
                    })
                    .collect(Collectors.toList());
        }

        return posts.stream().map(this::convertPostResponse).collect(Collectors.toList());
    }

    public ForumPostResponse getPostById(Long postId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại"));
        return convertPostResponse(post);
    }

    public ForumPostResponse createPost(ForumPostRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        ForumPost post = new ForumPost();
        post.setTitle(request.getTitle());
        post.setBody(request.getBody());
        post.setCategory(request.getCategory());
        post.setUser(user);
        post.setLikes(0);
        post.setDislikes(0);
        post.setReported(false);
        post.setReportCount(0);

        ForumPost saved = forumPostRepository.save(post);
        return convertPostResponse(saved);
    }

    public ForumPostResponse updatePost(Long postId, ForumPostRequest request, Long userId, boolean isAdmin) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại"));

        if (!isAdmin && !post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bài viết này");
        }

        post.setTitle(request.getTitle());
        post.setBody(request.getBody());
        post.setCategory(request.getCategory());
        ForumPost saved = forumPostRepository.save(post);
        return convertPostResponse(saved);
    }

    public void deletePost(Long postId, Long userId, boolean isAdmin) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại"));

        if (!isAdmin && !post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xoá bài viết này");
        }

        forumPostRepository.delete(post);
    }

    public ForumPostResponse likePost(Long postId) {
        ForumPost post = findPost(postId);
        post.setLikes(post.getLikes() + 1);
        return convertPostResponse(forumPostRepository.save(post));
    }

    public ForumPostResponse dislikePost(Long postId) {
        ForumPost post = findPost(postId);
        post.setDislikes(post.getDislikes() + 1);
        return convertPostResponse(forumPostRepository.save(post));
    }

    public ForumPostResponse reportPost(Long postId, Long userId) {
        ForumPost post = findPost(postId);
        post.setReported(true);
        post.setReportCount(post.getReportCount() + 1);
        return convertPostResponse(forumPostRepository.save(post));
    }

    public ForumCommentResponse addComment(Long postId, ForumCommentRequest request, Long userId) {
        ForumPost post = findPost(postId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        ForumComment comment = new ForumComment();
        comment.setContent(request.getContent());
        comment.setPost(post);
        comment.setUser(user);
        comment.setLikes(0);
        comment.setDislikes(0);
        comment.setReported(false);
        comment.setReportCount(0);

        ForumComment saved = forumCommentRepository.save(comment);
        post.getComments().add(saved);
        forumPostRepository.save(post);
        return convertCommentResponse(saved);
    }

    public ForumCommentResponse replyToComment(Long postId, Long parentCommentId, ForumCommentRequest request, Long userId) {
        ForumPost post = findPost(postId);
        ForumComment parentComment = forumCommentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        ForumComment reply = new ForumComment();
        reply.setContent(request.getContent());
        reply.setUser(user);
        reply.setPost(post);
        reply.setParentComment(parentComment);
        reply.setLikes(0);
        reply.setDislikes(0);
        reply.setReported(false);
        reply.setReportCount(0);

        ForumComment saved = forumCommentRepository.save(reply);
        parentComment.getReplies().add(saved);
        forumCommentRepository.save(parentComment);
        return convertCommentResponse(saved);
    }

    public ForumCommentResponse updateComment(Long commentId, ForumCommentRequest request, Long userId, boolean isAdmin) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));

        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bình luận này");
        }

        comment.setContent(request.getContent());
        ForumComment saved = forumCommentRepository.save(comment);
        return convertCommentResponse(saved);
    }

    public void deleteComment(Long commentId, Long userId, boolean isAdmin) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));

        if (!isAdmin && !comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xoá bình luận này");
        }

        forumCommentRepository.delete(comment);
    }

    public ForumCommentResponse likeComment(Long commentId) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));
        comment.setLikes(comment.getLikes() + 1);
        return convertCommentResponse(forumCommentRepository.save(comment));
    }

    public ForumCommentResponse dislikeComment(Long commentId) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));
        comment.setDislikes(comment.getDislikes() + 1);
        return convertCommentResponse(forumCommentRepository.save(comment));
    }

    public ForumCommentResponse reportComment(Long commentId, Long userId) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));
        comment.setReported(true);
        comment.setReportCount(comment.getReportCount() + 1);
        return convertCommentResponse(forumCommentRepository.save(comment));
    }

    public List<ForumReportResponse> getReportedItems() {
        List<ForumReportResponse> reports = new ArrayList<>();
        List<ForumPost> posts = forumPostRepository.findAll();

        for (ForumPost post : posts) {
            if (Boolean.TRUE.equals(post.getReported())) {
                reports.add(new ForumReportResponse("Bài viết", post.getTitle(), post.getUser().getUsername(), post.getCreatedAt(), post.getId(), null));
            }
            buildCommentReports(post.getComments(), reports, post.getId());
        }

        return reports;
    }

    public void resolvePostReport(Long postId) {
        ForumPost post = findPost(postId);
        post.setReported(false);
        post.setReportCount(0);
        forumPostRepository.save(post);
    }

    public void resolveCommentReport(Long commentId) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));
        comment.setReported(false);
        comment.setReportCount(0);
        forumCommentRepository.save(comment);
    }

    private ForumPost findPost(Long postId) {
        return forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại"));
    }

    private void buildCommentReports(List<ForumComment> comments, List<ForumReportResponse> reports, Long postId) {
        if (comments == null) {
            return;
        }
        for (ForumComment comment : comments) {
            if (Boolean.TRUE.equals(comment.getReported())) {
                reports.add(new ForumReportResponse("Bình luận", comment.getContent(), comment.getUser().getUsername(), comment.getCreatedAt(), postId, comment.getId()));
            }
            buildCommentReports(comment.getReplies(), reports, postId);
        }
    }

    private ForumPostResponse convertPostResponse(ForumPost post) {
        ForumPostResponse response = new ForumPostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setBody(post.getBody());
        response.setCategory(post.getCategory());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikes(post.getLikes());
        response.setDislikes(post.getDislikes());
        response.setReported(post.getReported());
        response.setReportCount(post.getReportCount());
        response.setUser(convertUserToDto(post.getUser()));
        response.setComments(post.getComments().stream()
                .filter(comment -> comment.getParentComment() == null)
                .map(this::convertCommentResponse)
                .collect(Collectors.toList()));
        return response;
    }

    private ForumCommentResponse convertCommentResponse(ForumComment comment) {
        ForumCommentResponse response = new ForumCommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setLikes(comment.getLikes());
        response.setDislikes(comment.getDislikes());
        response.setReported(comment.getReported());
        response.setReportCount(comment.getReportCount());
        response.setUser(convertUserToDto(comment.getUser()));
        response.setReplies(comment.getReplies().stream()
                .map(this::convertCommentResponse)
                .collect(Collectors.toList()));
        return response;
    }

    private com.example.game36h.dto.UserDto convertUserToDto(User user) {
        com.example.game36h.dto.UserDto dto = new com.example.game36h.dto.UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setAvatar(user.getAvatar());
        return dto;
    }
}
