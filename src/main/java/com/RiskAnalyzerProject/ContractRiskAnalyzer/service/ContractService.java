package com.RiskAnalyzerProject.ContractRiskAnalyzer.service;

import com.RiskAnalyzerProject.ContractRiskAnalyzer.exception.ResourceNotFound;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.model.Contract;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.repository.ContractRepository;

import ch.qos.logback.classic.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ContractService {

    private static final Logger logger = (Logger) LoggerFactory.getLogger(ContractService.class);

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private AiAnalysis aiAnalysis;

    public Contract processAndSaveContract(MultipartFile file,String username) throws IOException {
        try {
            String text = pdfService.Text(file);
            String analysis = aiAnalysis.AnalysisContract(text);

            Contract contract = new Contract();
            contract.setFilename(file.getOriginalFilename());
            contract.setRawText(text);
            contract.setAnalysisJson(analysis);
            contract.setUploadDate(LocalDateTime.now().toString());
            contract.setOwnerUsername(username);

            return contractRepository.save(contract);
        } catch (IOException e) {
            throw new RuntimeException("Failed to process file", e);
        }
    }
    public String chatWithAi(String question , String contractId , String conversationId){
        String contractText = null;
        if (contractId != null && !contractId.isEmpty() && !contractId.equalsIgnoreCase("general")) {
            Contract contract = contractRepository.findById(contractId)
                    .orElseThrow(() -> new RuntimeException("Contract not found"));
            contractText = contract.getExtractedText();
        }
            return aiAnalysis.chatWithAI(question, contractText, conversationId);
    }
    public Optional<Contract> getContractById(String id, String requestingUser) {
        Optional<Contract> contract = contractRepository.findById(id);
        if (contract.isPresent()) {
            Contract c = contract.get();
            if (!c.getOwnerUsername().equals(requestingUser)) {
                return Optional.empty();
            }
        }
            return contract;
    }

    public List<Contract> getAllContracts(String username)
    {
        return contractRepository.findByOwnerUsername(username);
    }

    // DELETE METHOD
    public void deleteContract(String id, String username) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Contract not found with id: " + id));

        if (!contract.getOwnerUsername().equals(username)) {
            throw new AccessDeniedException("You are not authorized to delete this contract");
        }
        contractRepository.deleteById(id);
    }
}
