package com.RiskAnalyzerProject.ContractRiskAnalyzer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String debugUsername;

    private final String SENDER_EMAIL = "Contract Risk Analyzer <animeshj425@gmail.com>";

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(SENDER_EMAIL);
        message.setTo(toEmail);
        message.setSubject("Your Contract Risk Analyzer OTP");
        message.setText("Your verification code is: " + otp + "\n\nThis code expires in 1 minutes.");

        mailSender.send(message);
    }
    public void sendResetPasswordEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(SENDER_EMAIL);
        message.setTo(toEmail);
        message.setSubject("Reset Your Password - Contract Risk Analyzer");
        message.setText("You requested a password reset." +
                        "\n\nYour reset code is: " + otp +
                         "\n\nThis code expires in 1 minutes. " +
                         "If you did not request this, please ignore this email.");
        mailSender.send(message);
    }
}