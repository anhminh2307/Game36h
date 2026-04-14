package com.example.game36h.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDto {
    private Long id;
    private Long gameId;
    private String gameTitle;
    private String gameThumbnail;
    private String gameUrl;
    private LocalDateTime playedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    
    public String getGameTitle() { return gameTitle; }
    public void setGameTitle(String gameTitle) { this.gameTitle = gameTitle; }
    
    public String getGameThumbnail() { return gameThumbnail; }
    public void setGameThumbnail(String gameThumbnail) { this.gameThumbnail = gameThumbnail; }
    
    public String getGameUrl() { return gameUrl; }
    public void setGameUrl(String gameUrl) { this.gameUrl = gameUrl; }
    
    public LocalDateTime getPlayedAt() { return playedAt; }
    public void setPlayedAt(LocalDateTime playedAt) { this.playedAt = playedAt; }
}
