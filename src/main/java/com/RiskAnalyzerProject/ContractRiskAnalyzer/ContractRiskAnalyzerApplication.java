package com.RiskAnalyzerProject.ContractRiskAnalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ContractRiskAnalyzerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ContractRiskAnalyzerApplication.class, args);
	}
}
