package com.example.game36h.dto;

import lombok.Data;

@Data
public class RatingRequest {
    private Long gameId;
    private Integer score;

    public Long getGameId() { return gameId; }
    public void setGameId(Long gameId) { this.gameId = gameId; }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}
