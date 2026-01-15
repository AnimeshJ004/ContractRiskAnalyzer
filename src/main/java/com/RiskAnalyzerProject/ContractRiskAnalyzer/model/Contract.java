package com.RiskAnalyzerProject.ContractRiskAnalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "contracts")
public class Contract {
    @Id
    private String id;
    private String ownerUsername;
    private String filename;
    private String uploadDate;
    private String rawText; //Extract-> text from pdf
    private String analysisJson; //Return->Json String by AI

    public String getExtractedText() {
        return this.rawText;
    }

    }
