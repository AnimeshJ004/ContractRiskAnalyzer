package com.RiskAnalyzerProject.ContractRiskAnalyzer.controller;

import com.RiskAnalyzerProject.ContractRiskAnalyzer.model.User;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.dto.LoginRequest;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.dto.RegisterRequest;
import java.security.Principal;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.dto.ResetPasswordRequest;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.dto.OAuth2CompleteRequest;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.util.JwtUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private com.RiskAnalyzerProject.ContractRiskAnalyzer.util.JwtUtil jwtUtil;


    @Valid
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(request.getRole()); // Service handles default "USER" if null
            String result = authService.registerUser(user);
            return ResponseEntity.ok(result);
    }
    @Valid
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
            User user = new User();
            user.setUsername(loginRequest.getUsername());
            user.setPassword(loginRequest.getPassword());
            String message = authService.loginUser(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", message);
            response.put("message", "OTP_Sent Successfully");
            return ResponseEntity.ok(response);
    }
    @PostMapping("/login/verify")
    public ResponseEntity<?> verifyLogin(@RequestParam String username, @RequestParam String otp) {
            String jwt = authService.verifyLoginOtp(username, otp);
            Map<String, String> response = new HashMap<>();
            response.put("token", jwt);
            response.put("message", "Login Successful");
            return ResponseEntity.ok(response);
         }
    @PostMapping("/logout")
    public ResponseEntity<String> logoutUser(HttpServletRequest request, HttpServletResponse response) {
        authService.logOutUser(request, response);
        return ResponseEntity.ok("Logout Successful");
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        User user = authService.getUserProfile(principal.getName());
        // Return only safe fields (avoid sending password/otp)
        Map<String, String> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(Principal principal) {
        authService.deleteAccount(principal.getName());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        authService.initiatePasswordReset(email);
        return ResponseEntity.ok(Map.of("message", "Reset Password Successfully"));
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now login."));
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        authService.verifyOtp(email, otp);
        return ResponseEntity.ok(Map.of("message", "OTP Verified Successfully"));
    }
    @PostMapping("/oauth-complete")
    public ResponseEntity<?> completeOAuthRegistration(@RequestBody com.RiskAnalyzerProject.ContractRiskAnalyzer.dto.OAuth2CompleteRequest request) {
        // 1. Verify the temp token matches the email (Security Check)
        if (!jwtUtil.validateToken(request.getTempToken(), request.getEmail())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired registration session."));
        }

        // 2. Determine Password (User provided OR Dummy)
        String finalPassword = (request.getPassword() != null && !request.getPassword().isEmpty())
                ? request.getPassword()
                : java.util.UUID.randomUUID().toString(); // Dummy Password

        // 3. Create User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(finalPassword);
        user.setRole("USER");

        // 4. Save User (using your service logic ideally, but direct here for brevity)
        authService.registerUser(user);

        // 5. Generate Real Login Token
        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(Map.of("token", token));
    }
}