package com.example.game36h.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url:http://127.0.0.1:5500/frontend/}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password.html?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Đặt lại mật khẩu - Game36h");
        message.setText("Xin chào,\n\n" +
                "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Game36h.\n\n" +
                "Vui lòng click vào link bên dưới để đặt lại mật khẩu:\n" +
                resetUrl + "\n\n" +
                "Link này sẽ hết hạn sau 24 giờ.\n\n" +
                "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\n" +
                "Game36h Team");

        mailSender.send(message);
    }

    public void sendSimpleEmail(String toEmail, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }
}
