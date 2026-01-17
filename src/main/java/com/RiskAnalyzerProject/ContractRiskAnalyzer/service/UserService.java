package com.RiskAnalyzerProject.ContractRiskAnalyzer.service;

import com.RiskAnalyzerProject.ContractRiskAnalyzer.model.User;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public void deleteUserAccount(String username, String password) {
        // 1. Find the user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Check if the password matches
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Incorrect password. Account not deleted.");
        }

        // 3. Delete the user
        userRepository.delete(user);
    }
}
