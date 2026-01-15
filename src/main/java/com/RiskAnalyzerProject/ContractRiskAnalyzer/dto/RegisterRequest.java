package com.RiskAnalyzerProject.ContractRiskAnalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;
    @NotBlank(message = "Email is required")
    @Pattern(regexp = "^[A-Za-z0-9._%+-]+@gmail\\.com$", message = "Email must be a valid!")
    private  String Email;
    @NotBlank(message = "Password is required")
    private String password;
    private String role; // Optional, defaults to USER if null
}