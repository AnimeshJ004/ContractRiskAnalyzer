package com.RiskAnalyzerProject.ContractRiskAnalyzer.controller;

import com.RiskAnalyzerProject.ContractRiskAnalyzer.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/users") // Base path for user management
public class UserController {

    @Autowired
    private UserService userService;

    // Endpoint: DELETE /users/delete-account
    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteMyAccount(@RequestBody Map<String, String> request, Principal principal) {
        // Extract data
        String password = request.get("password");
        String username = principal.getName(); // Get the username securely from the JWT token

        try {
            // Call the service to perform the deletion
            userService.deleteUserAccount(username, password);

            return ResponseEntity.ok(Map.of("message", "Account deleted successfully."));
        } catch (RuntimeException e) {
            // Return 401 Unauthorized if password is wrong
            // We use 401 or 400 depending on the specific error, but 401 is good for auth failures
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }
}