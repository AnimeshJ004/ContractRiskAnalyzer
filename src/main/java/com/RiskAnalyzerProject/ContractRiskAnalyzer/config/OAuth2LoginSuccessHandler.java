package com.RiskAnalyzerProject.ContractRiskAnalyzer.config;

import com.RiskAnalyzerProject.ContractRiskAnalyzer.model.User;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.repository.UserRepository;
import com.RiskAnalyzerProject.ContractRiskAnalyzer.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<User> existingUser = userRepository.findByEmail(email);

        // 1. Determine user intent from cookie (default to "login" if missing)
        String authIntent = "login";
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("auth_intent".equals(cookie.getName())) {
                    authIntent = cookie.getValue();
                    break;
                }
            }
        }

        if (existingUser.isPresent()) {
            // SCENARIO: User Exists

            if ("register".equals(authIntent)) {
                // If they tried to REGISTER but account exists -> Redirect to Login with Error
                String targetUrl = "http://localhost:5173/login?error=user_exists";
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
            } else {
                // Normal Login -> Dashboard
                String token = jwtUtil.generateToken(existingUser.get().getUsername());
                String targetUrl = "http://localhost:5173/login?token=" + token;
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
            }

        } else {
            // SCENARIO: New User

            // Redirect to "Complete Registration" page (even if intent was 'login', because they don't exist yet)
            String tempToken = jwtUtil.generateToken(email);
            String targetUrl = "http://localhost:5173/complete-registration"
                    + "?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                    + "&name=" + URLEncoder.encode(name != null ? name : "", StandardCharsets.UTF_8)
                    + "&tempToken=" + tempToken;

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }
}