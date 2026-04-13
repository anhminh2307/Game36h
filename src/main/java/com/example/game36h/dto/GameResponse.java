package com.example.game36h.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GameResponse {
    private Long id;
    private String title;
    private String description;
    private String thumbnail;
    private String gameUrl;
    private CategoryDto category;
    private UserDto user;
    private String status;
    private Long views;
    private LocalDateTime createdAt;
    private Double averageRating;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    
    public String getGameUrl() { return gameUrl; }
    public void setGameUrl(String gameUrl) { this.gameUrl = gameUrl; }
    
    public CategoryDto getCategory() { return category; }
    public void setCategory(CategoryDto category) { this.category = category; }
    
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Long getViews() { return views; }
    public void setViews(Long views) { this.views = views; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
}
