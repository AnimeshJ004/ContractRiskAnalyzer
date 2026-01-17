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

    @Cacheable(value = "contractAnalysis", key = "#contractText.hashCode()")
    public String AnalysisContract(String contractText) {
        String safeText = contractText.length() > 10000
                ? contractText.substring(0, 10000) : contractText;
        String prompt = """
                ROLE:
                     You are a Senior Legal Risk Assessor with 20 years of experience in contract law.\s
                     Your job is to protect the client by identifying dangerous clauses, loopholes, and missing protections.
                
                TASK:
                     Analyze the provided contract text strictly for RISK. Do not summarize the good parts; focus on the bad parts.
                
                     ANALYSIS GUIDELINES:
                            1. Look for 'Indemnification' clauses that are one-sided.
                            2. Check for 'Termination' clauses (is it easy to exit?).
                            3. Analyze 'Liability Caps' (is the limit too low?).
                            4. Identify 'Jurisdiction' (is it in a favorable location?).
                            5. Flag any 'Auto-renewal' traps.
                
                OUTPUT FORMAT:
                    Return the result in valid, strict JSON format. Do not use Markdown (```json). Do not add conversational text.
                
                        JSON STRUCTURE:
                        {
                          "summary": "A concise 3-sentence executive summary of the contract type and purpose.",
                          "risk_score": "Integer between 0 (Safe) and 100 (Extremely Dangerous)",
                          "risk_level": "Low / Medium / High",
                          "key_risks": [
                            {
                              "clause": "Name of the risky clause (e.g., 'Indemnity')",
                              "risk_explanation": "Why this is dangerous (e.g., 'Requires you to pay for all 3rd party claims without limit.')",
                              "severity": "High/Medium/Low"
                            }
                          ],
                          "missing_clauses": ["List of standard protections missing (e.g., 'Confidentiality Clause', 'Force Majeure')"],
                          "recommendations": ["Actionable advice 1", "Actionable advice 2"]
                        }
                CONTRACT TEXT:
                """ + safeText;
       // Force temperature to 0.0 for consistent analysis
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .temperature(0.0) // 0.0 = Deterministic / Consistent
                .build();
        // Call the AI model
        return chatClient.prompt()
                .user(prompt)
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
                .temperature(0.0)
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
