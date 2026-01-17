package com.RiskAnalyzerProject.ContractRiskAnalyzer.dto;

import lombok.Data;

@Data
public class OAuth2CompleteRequest {
    private String email;
    private String username;
    private String password; // Optional
    private String tempToken; // To verify the email matches the Google login
}