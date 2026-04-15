package com.example.game36h.service;

import com.example.game36h.entity.Notification;
import com.example.game36h.entity.User;
import com.example.game36h.repository.NotificationRepository;
import com.example.game36h.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<Notification> getUnreadNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false, pageable);
    }

    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    public Notification createNotification(Long userId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setContent(content);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public Notification markAsUnread(Long id) {
        Notification notification = getNotificationById(id);
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found");
        }
        notificationRepository.deleteById(id);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false, Pageable.unpaged()).getTotalElements();
    }

    public void markAllAsRead(Long userId) {
        Page<Notification> unreadNotifications = getUnreadNotifications(userId, Pageable.unpaged());
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications.getContent());
    }
}
