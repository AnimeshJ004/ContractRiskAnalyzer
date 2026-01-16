package com.RiskAnalyzerProject.ContractRiskAnalyzer.service;

import com.RiskAnalyzerProject.ContractRiskAnalyzer.exception.AppException;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.exception.ResourceNotFound;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.model.User;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.repository.UserRepository;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    public String registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException("Error: Email is already in use!");
        }
        user.setVerified(true);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        userRepository.save(user);
        return "User registered successfully!";
    }

    public String loginUser(User loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFound("User not found with username: " + loginRequest.getUsername()));

        // Check if account is verified
        if (!user.isVerified()) {
            throw new AppException("Account not verified. Please verify your email first.");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(1));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);

        return "OTP sent to email";
    }

    public String verifyLoginOtp(String username, String otp) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFound("User not found with username: " + username));

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new AppException("OTP has expired. Please login again to generate a new one.");
        }

        if (!user.getOtp().equals(otp)) {
            throw new BadCredentialsException("Invalid OTP provided");
        }

        // Clear OTP after success
        user.setOtp(null);
        userRepository.save(user);

        // Return the actual JWT Token
        return jwtUtil.generateToken(username);
    }

    public void logOutUser(HttpServletRequest request, HttpServletResponse response) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.blacklistToken(token);
        }

        // Standard logout
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);
        }
    }
    public User getUserProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFound("User not found"));
    }
    // 2. Delete User Account
    public void deleteAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFound("User not found"));
        userRepository.delete(user);
    }
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFound("User not found with email: " + email));

        // Generate OTP
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(1));
        userRepository.save(user);

        // Send Email
        emailService.sendResetPasswordEmail(user.getEmail(), otp);
    }
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFound("User not found with email: " + email));

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired"); // GlobalExceptionHandler handles RuntimeException generally, or use AppException
        }

        if (!user.getOtp().equals(otp)) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid OTP");
        }

        // Update Password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null); // Clear used OTP
        userRepository.save(user);
    }
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFound("User not found"));

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        if (!user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
    }
}