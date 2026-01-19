package com.RiskAnalyzerProject.ContractRiskAnalyzer.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiAnalysis {

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;

    @Autowired
    public AiAnalysis(ChatModel chatModel, ChatMemory chatMemory) {
        this.chatMemory = chatMemory;
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    @Cacheable(value = "contractAnalysis", key = "#contractText.hashCode()+ #jurisdiction + #contractType")
    public String AnalysisContract(String contractText, String jurisdiction, String contractType) {
        String safeText = contractText.length() > 10000
                ? contractText.substring(0, 10000) : contractText;
        String prompt = """
                ROLE:
                     You are a Senior Legal Risk Assessor.
                
                CONTEXT:
                     Analyze this contract under **%s LAW**.
                     The user claims this is a **%s**.
                
                TASK:
                     1. Risk Analysis: Identify dangerous clauses and loopholes.
                     2. **COMPARISON**: Compare this document against a STANDARD, FAIR version of a %s.
                        - What standard clauses are missing? (e.g., Severability, Confidentiality)
                        - Is any standard clause unusually harsh?
                
                OUTPUT FORMAT:
                    Return the result in valid, strict JSON format:
                        {
                          "summary": "...",
                          "risk_score": 0-100,
                          "risk_level": "Low/Medium/High",
                          "key_risks": [...],
                          "missing_clauses": ["List missing standard clauses for this contract type"],
                          "comparison_notes": "A short paragraph explaining how this deviates from a standard %s." 
                        }
                
                CONTRACT TEXT:
                """.formatted(jurisdiction.toUpperCase(), contractType.toUpperCase(), contractType.toUpperCase(), contractType.toUpperCase()) + safeText;
       // Force temperature to 0.0 for consistent analysis
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .temperature(0.1)
                .build();
        // Call the AI model
        return chatClient.prompt()
                .user(prompt)
                .options(options)
                .call()
                .content();

    }
    public String chatWithAI(String question , String contractText,String conversationId) {
        String prompt = question;
        if (contractText != null && !contractText.isEmpty()) {
            String safeText = contractText.length() > 15000
                    ? contractText.substring(0, 15000)
                    : contractText;
            prompt = """
                    You are a legal assistant. Use the following contract text to answer the user's question.
                     If the answer is not in the text, say you don't know.
                    
                     --- CONTRACT TEXT START ---
                     %s
                     --- CONTRACT TEXT END ---
                    
                     User Question: %s
                    """.formatted(contractText, question);
        }else {
            // General Chat Mode
            prompt = "You are a General AI Legal Assistant. You can help with general legal concepts, definitions, and drafting advice.";
        }
        // 1. Retrieve full history
        List<Message> fullHistory = chatMemory.get(conversationId);
        int maxHistory = 20;
        List<Message> recentHistory;
        if (fullHistory.size() > maxHistory) {
            recentHistory = fullHistory.subList(fullHistory.size() - maxHistory, fullHistory.size());
        } else {
            recentHistory = fullHistory;
        }
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model("llama-3.3-70b-versatile")
                .temperature(0.1)
                .build();
        String response =  chatClient.prompt()
                .system(prompt)
                .messages(recentHistory)
                .user(question)
                .options(options)
                .call()
                .content();
        chatMemory.add(conversationId, new UserMessage(question));
        chatMemory.add(conversationId, new AssistantMessage(response));

        return response;
    }
}
