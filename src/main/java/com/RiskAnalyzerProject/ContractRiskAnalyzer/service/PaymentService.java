//package com.RiskAnalyzerProject.ContractRiskAnalyzer.service;
//
//import com.RiskAnalyzerProject.ContractRiskAnalyzer.model.User;
//import com.RiskAnalyzerProject.ContractRiskAnalyzer.repository.UserRepository;
//import com.razorpay.Order;
//import com.razorpay.RazorpayClient;
//import com.razorpay.RazorpayException;
//import com.razorpay.Utils;
//import org.json.JSONObject;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Map;
//
//@Service
//public class PaymentService {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Value("${razorpay.key.id}")
//    private String razorpayKeyId;
//
//    @Value("${razorpay.key.secret}")
//    private String razorpayKeySecret;
//
//    // 1. Create Order Logic
//    public String createOrder(int amount) throws RazorpayException {
//        // Validate Plan
//        if (amount != 50 && amount != 80) {
//            throw new IllegalArgumentException("Invalid plan amount. Available plans: 50 or 80.");
//        }
//
//        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
//
//        JSONObject orderRequest = new JSONObject();
//        orderRequest.put("amount", amount * 100); // Amount in paise (e.g., 5000 paise = ₹50)
//        orderRequest.put("currency", "INR");
//        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());
//
//        Order order = client.orders.create(orderRequest);
//        return order.toString();
//    }
//
//    // 2. Verify Payment & Add Tokens Logic
//    @Transactional
//    public void verifyAndCreditTokens(String paymentId, String orderId, String signature, String username, int amount) throws RazorpayException {
//
//        // A. Verify Signature to prevent tampering
//        JSONObject options = new JSONObject();
//        options.put("razorpay_order_id", orderId);
//        options.put("razorpay_payment_id", paymentId);
//        options.put("razorpay_signature", signature);
//
//        boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
//
//        if (!isValid) {
//            throw new RuntimeException("Payment signature verification failed");
//        }
//
//        // B. Credit Tokens based on Plan
//        User user = userRepository.findByUsername(username)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if (amount == 50) {
//            user.setExtraTokens(user.getExtraTokens() + 2); // 2 tokens for ₹50
//        } else if (amount == 80) {
//            user.setExtraTokens(user.getExtraTokens() + 5); // 5 tokens for ₹80
//        } else {
//            throw new IllegalArgumentException("Invalid amount for token credit");
//        }
//
//        userRepository.save(user);
//    }
//}