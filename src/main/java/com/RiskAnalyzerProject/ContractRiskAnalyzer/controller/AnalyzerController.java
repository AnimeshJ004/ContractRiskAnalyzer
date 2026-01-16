package com.RiskAnalyzerProject.ContractRiskAnalyzer.controller;

import com.RiskAnalyzerProject.ContractRiskAnalyzer.dto.ChatRequest;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.model.Contract;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.service.ContractService;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "*")
public class AnalyzerController {

    @Autowired
    private ContractService contractService;

    @GetMapping
    public List<Contract> getAllContracts( Principal principal) {
        return contractService.getAllContracts(principal.getName());
    }
    @GetMapping("/{id}")
    public ResponseEntity<Contract> getContractById(@PathVariable String id, Principal principal) {
            return contractService.getContractById(id,principal.getName())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.status(403).build());
        }
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Contract> uploadContract(@RequestParam("file") MultipartFile file, Principal  principal) throws IOException, java.io.IOException {
        Contract savedContract = contractService.processAndSaveContract(file , principal.getName());
        return ResponseEntity.ok(savedContract);
}
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithAI(@RequestBody ChatRequest request) {
            // Call the single unified method
            String conversationId = request.getConversationId();
            if (conversationId == null || conversationId.isEmpty()) {
                conversationId = UUID.randomUUID().toString();
            }
            String response = contractService.chatWithAi(
                    request.getQuestion(),
                    request.getContractId(),
                    conversationId
            );
            return ResponseEntity.ok(Map.of(
                    "response", response,
                    "conversationId", conversationId
            ));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContract(@PathVariable String id, Principal principal) {
            contractService.deleteContract(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Contract deleted successfully"));
        }
}
