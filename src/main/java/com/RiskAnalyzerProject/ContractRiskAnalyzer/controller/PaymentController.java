//package com.RiskAnalyzerProject.ContractRiskAnalyzer.controller;
//
//import com.RiskAnalyzerProject.ContractRiskAnalyzer.service.PaymentService;
//import com.razorpay.RazorpayException;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.security.Principal;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/payment")
//@CrossOrigin(origins = "*")
//public class PaymentController {
//
//    @Autowired
//    private PaymentService paymentService;
//
//    @PostMapping("/create-order")
//    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
//        try {
//            int amount = Integer.parseInt(data.get("amount").toString());
//            String orderResponse = paymentService.createOrder(amount);
//            return ResponseEntity.ok(orderResponse);
//        } catch (RazorpayException e) {
//            return ResponseEntity.status(500).body("Error creating Razorpay order: " + e.getMessage());
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//    }
//
//    @PostMapping("/verify-payment")
//    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data, Principal principal) {
//        try {
//            String paymentId = data.get("razorpay_payment_id");
//            String orderId = data.get("razorpay_order_id");
//            String signature = data.get("razorpay_signature");
//            int amount = Integer.parseInt(data.get("amount"));
//
//            paymentService.verifyAndCreditTokens(paymentId, orderId, signature, principal.getName(), amount);
//
//            return ResponseEntity.ok(Map.of("message", "Payment successful, tokens added!"));
//        } catch (Exception e) {
//            return ResponseEntity.status(400).body("Payment verification failed: " + e.getMessage());
//        }
//    }
//}