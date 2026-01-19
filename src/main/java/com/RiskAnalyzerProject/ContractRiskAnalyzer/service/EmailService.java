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

    @Value("${app.email.sender}")
    private String SENDER_EMAIL;

    private void sendEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(this.SENDER_EMAIL);
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Your Contract Risk Analyzer OTP";
        String body = "Your verification code is: " + otp + "\n\nThis code expires in 1 minute.";
        sendEmail(toEmail, subject, body);
    }
    public void sendResetPasswordEmail(String toEmail, String otp) {
        String subject = ("Reset Your Password - Contract Risk Analyzer");
        String body =  "You requested a password reset." +
                        "\n\nYour reset code is: " + otp +
                         "\n\nThis code expires in 1 minutes. " +
                         "If you did not request this, please ignore this email.";
        sendEmail(toEmail, subject, body);
    }
}