package com.RiskAnalyzerProject.ContractRiskAnalyzer.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id; //Evry username is uniquely define
    private String username;
    private String email;
    private String password; //encrypt
    private String role; // Who are you -> User or admin

    private String otp;
    private LocalDateTime otpExpiryTime;
    private boolean isVerified = false;

//    private int extraTokens = 0;
}
