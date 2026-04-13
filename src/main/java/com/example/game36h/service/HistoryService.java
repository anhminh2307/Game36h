package com.example.game36h.service;

import com.example.game36h.dto.HistoryDto;
import com.example.game36h.entity.History;
import com.example.game36h.entity.Game;
import com.example.game36h.entity.User;
import com.example.game36h.repository.HistoryRepository;
import com.example.game36h.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class HistoryService {

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private GameRepository gameRepository;

    public History addToHistory(Long gameId, Long userId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        History history = new History();
        
        User user = new User();
        user.setId(userId);
        history.setUser(user);
        
        history.setGame(game);
        
        return historyRepository.save(history);
    }

    public Page<History> getUserHistory(Long userId, Pageable pageable) {
        return historyRepository.findByUserIdOrderByPlayedAtDesc(userId, pageable);
    }

    public History getHistoryById(Long id) {
        return historyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("History not found with id: " + id));
    }

    public void deleteHistoryById(Long id) {
        History history = historyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("History not found with id: " + id));
        historyRepository.delete(history);
    }

    public Page<HistoryDto> getUserHistoryDto(Long userId, Pageable pageable) {
        Page<History> histories = historyRepository.findByUserIdOrderByPlayedAtDesc(userId, pageable);
        return histories.map(this::convertToDto);
    }

    private HistoryDto convertToDto(History history) {
        HistoryDto dto = new HistoryDto();
        dto.setId(history.getId());
        dto.setPlayedAt(history.getPlayedAt());
        
        if (history.getGame() != null) {
            dto.setGameId(history.getGame().getId());
            dto.setGameTitle(history.getGame().getTitle());
            dto.setGameThumbnail(history.getGame().getThumbnail());
            dto.setGameUrl(history.getGame().getGameUrl());
        }
        
        return dto;
    }
}
