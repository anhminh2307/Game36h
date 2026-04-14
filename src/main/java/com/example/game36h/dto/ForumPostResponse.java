package com.example.game36h.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ForumPostResponse {
    private Long id;
    private String title;
    private String body;
    private String category;
    private LocalDateTime createdAt;
    private Integer likes;
    private Integer dislikes;
    private Boolean reported;
    private Integer reportCount;
    private UserDto user;
    private List<ForumCommentResponse> comments = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
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
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    public List<ForumCommentResponse> getComments() { return comments; }
    public void setComments(List<ForumCommentResponse> comments) { this.comments = comments; }
}
