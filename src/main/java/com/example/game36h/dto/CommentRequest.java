package com.example.game36h.dto;

import lombok.Data;

@Data
public class CommentRequest {
    private Long gameId;
    private String content;

    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
