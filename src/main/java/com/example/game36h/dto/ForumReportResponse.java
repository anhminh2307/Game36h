package com.example.game36h.dto;

import java.time.LocalDateTime;

public class ForumReportResponse {
    private String type;
    private String summary;
    private String author;
    private LocalDateTime createdAt;
    private Long postId;
    private Long commentId;

    public ForumReportResponse() {}

    public ForumReportResponse(String type, String summary, String author, LocalDateTime createdAt, Long postId, Long commentId) {
        this.type = type;
        this.summary = summary;
        this.author = author;
        this.createdAt = createdAt;
        this.postId = postId;
        this.commentId = commentId;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }
}
