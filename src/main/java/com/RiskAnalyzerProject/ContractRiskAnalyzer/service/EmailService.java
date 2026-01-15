package com.RiskAnalyzerProject.ContractRiskAnalyzer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String debugUsername;

    @PostConstruct
    public void init() {
        System.out.println("==========================================");
        System.out.println("DEBUG: Email Username loaded as: " + debugUsername);
        System.out.println("==========================================");
    }
    private final String SENDER_EMAIL = "animeshj425@gmail.com";

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(SENDER_EMAIL);
        message.setTo(toEmail);
        message.setSubject("Your Contract Risk Analyzer OTP");
        message.setText("Your verification code is: " + otp + "\n\nThis code expires in 5 minutes.");

        mailSender.send(message);
    }
}