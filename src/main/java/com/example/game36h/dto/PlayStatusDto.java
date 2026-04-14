package com.example.game36h.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayStatusDto {
    private Long playTimeToday; // in minutes
    private LocalDateTime lastPlayDate;
    private Boolean isLocked;
    private LocalDateTime lockUntil;
    private Long remainingTime; // remaining minutes until 180
    private String message; // for locked status
}