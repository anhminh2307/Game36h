package com.example.game36h.dto;

import lombok.Data;

@Data
public class GameRequest {
    private String title;
    private String description;
    private String thumbnail;
    private String gameUrl;
    private Long categoryId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    
    public String getGameUrl() { return gameUrl; }
    public void setGameUrl(String gameUrl) { this.gameUrl = gameUrl; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}
