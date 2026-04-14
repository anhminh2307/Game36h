package com.example.game36h.service;

import com.example.game36h.dto.PlayStatusDto;
import com.example.game36h.dto.UserDto;
import com.example.game36h.entity.User;
import com.example.game36h.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserDto(user);
    }

    public UserDto updateUserProfile(Long userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDto.getUsername() != null && !userDto.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(userDto.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            user.setUsername(userDto.getUsername());
        }

        if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDto.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(userDto.getEmail());
        }

        if (userDto.getAvatar() != null) {
            user.setAvatar(userDto.getAvatar());
        }

        User updatedUser = userRepository.save(user);
        return convertToUserDto(updatedUser);
    }

    public UserDto findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToUserDto(user);
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToUserDto);
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    private UserDto convertToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setAvatar(user.getAvatar());
        return dto;
    }

    public PlayStatusDto getPlayStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Reset play time if it's a new day
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastPlayDate() == null || !user.getLastPlayDate().toLocalDate().equals(now.toLocalDate())) {
            user.setPlayTimeToday(0L);
            user.setIsLocked(false);
            user.setLockUntil(null);
            userRepository.save(user);
        }

        PlayStatusDto status = new PlayStatusDto();
        status.setPlayTimeToday(user.getPlayTimeToday());
        status.setLastPlayDate(user.getLastPlayDate());
        status.setIsLocked(user.getIsLocked());
        status.setLockUntil(user.getLockUntil());

        long remainingTime = 180 - user.getPlayTimeToday();
        status.setRemainingTime(Math.max(0, remainingTime));

        if (user.getIsLocked() && user.getLockUntil() != null && now.isBefore(user.getLockUntil())) {
            long minutesLeft = java.time.Duration.between(now, user.getLockUntil()).toMinutes();
            status.setMessage("Bạn đã chơi quá 180 phút, bạn hãy đợi " + minutesLeft + " phút nữa để được chơi tiếp");
        } else if (user.getPlayTimeToday() >= 180) {
            status.setMessage("Bạn đã chơi quá 180 phút, bạn hãy đợi 2 tiếng nữa để được chơi tiếp");
        }

        return status;
    }

    public boolean canPlay(Long userId) {
        PlayStatusDto status = getPlayStatus(userId);
        return !status.getIsLocked() && status.getPlayTimeToday() < 180;
    }

    public void startPlay(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();

        // Reset if new day
        if (user.getLastPlayDate() == null || !user.getLastPlayDate().toLocalDate().equals(now.toLocalDate())) {
            user.setPlayTimeToday(0L);
            user.setIsLocked(false);
            user.setLockUntil(null);
        }

        if (!canPlay(userId)) {
            throw new RuntimeException("User cannot play at this time");
        }

        user.setLastPlayDate(now);
        userRepository.save(user);
    }

    public void updatePlayTime(Long userId, long minutesPlayed) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();

        // Reset if new day
        if (user.getLastPlayDate() == null || !user.getLastPlayDate().toLocalDate().equals(now.toLocalDate())) {
            user.setPlayTimeToday(0L);
            user.setIsLocked(false);
            user.setLockUntil(null);
        }

        long newPlayTime = user.getPlayTimeToday() + minutesPlayed;
        user.setPlayTimeToday(newPlayTime);
        user.setLastPlayDate(now);

        if (newPlayTime >= 180) {
            user.setIsLocked(true);
            user.setLockUntil(now.plusHours(2));
        }

        userRepository.save(user);
    }
}
