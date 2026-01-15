package com.RiskAnalyzerProject.ContractRiskAnalyzer.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String question;
    private String contractId;
    private String conversationId;

    public String getConvsersationId() {
        return conversationId;
    }
}
