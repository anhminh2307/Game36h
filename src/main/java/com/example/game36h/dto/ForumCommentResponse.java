package com.example.game36h.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ForumCommentResponse {
    private Long id;
    private UserDto user;
    private String content;
    private LocalDateTime createdAt;
    private Integer likes;
    private Integer dislikes;
    private Boolean reported;
    private Integer reportCount;
    private List<ForumCommentResponse> replies = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Integer getLikes() { return likes; }
    public void setLikes(Integer likes) { this.likes = likes; }
    public Integer getDislikes() { return dislikes; }
    public void setDislikes(Integer dislikes) { this.dislikes = dislikes; }
    public Boolean getReported() { return reported; }
    public void setReported(Boolean reported) { this.reported = reported; }
    public Integer getReportCount() { return reportCount; }
    public void setReportCount(Integer reportCount) { this.reportCount = reportCount; }
    public List<ForumCommentResponse> getReplies() { return replies; }
    public void setReplies(List<ForumCommentResponse> replies) { this.replies = replies; }
}
