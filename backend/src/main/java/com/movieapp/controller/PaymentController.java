package com.movieapp.controller;

import com.movieapp.dto.CreatePaymentRequest;
import com.movieapp.entity.Payment;
import com.movieapp.response.ApiResponse;
import com.movieapp.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlans() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPlans()));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        String ipAddress = httpRequest.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        String paymentUrl = paymentService.createPayment(
                authentication.getName(), request, ipAddress
        );
        return ResponseEntity.ok(ApiResponse.success(Map.of("paymentUrl", paymentUrl)));
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> params = request.getParameterMap().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue()[0]));

        Payment payment = paymentService.processVnPayReturn(params);

        // Redirect to frontend payment result page
        String frontendUrl = "http://localhost:5173/payment-result"
                + "?status=" + payment.getStatus()
                + "&txnRef=" + payment.getVnpTxnRef();
        response.sendRedirect(frontendUrl);
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<?>> getPaymentHistory(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.getUserPayments(authentication.getName())
        ));
    }
}
