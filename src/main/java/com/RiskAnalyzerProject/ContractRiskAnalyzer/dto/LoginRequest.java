package com.RiskAnalyzerProject.ContractRiskAnalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username;
    @NotBlank(message = "Password is required!")
    private String password;
}
