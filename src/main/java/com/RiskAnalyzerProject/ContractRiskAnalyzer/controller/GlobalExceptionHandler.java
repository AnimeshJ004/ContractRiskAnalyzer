package com.RiskAnalyzerProject.ContractRiskAnalyzer.controller; // <--- MAKE SURE THIS MATCHES YOUR FOLDER

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest; // Import needed for generic handling

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Handle Specifc Arithmetic Errors (like our /trigger-error test)
    @ExceptionHandler(ArithmeticException.class)
    public ResponseEntity<Map<String, Object>> handleMathError(ArithmeticException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Math Calculation Error");
        body.put("message", "You tried to divide by zero!");

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handle Everything Else
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllErrors(Exception ex, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Global Application Error");
        body.put("message", ex.getClass().getSimpleName() + ": " + ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Error");

        // Extract the specific error message (e.g., "Email must be a valid @gmail.com address")
        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            errors.append(error.getDefaultMessage()).append("; ");
        });

        body.put("message", errors.toString());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}