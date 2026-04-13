package com.movieapp.service;

import com.movieapp.config.VnPayProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VnPayProperties vnPayProperties;

    private static final String VNP_VERSION = "2.1.0";
    private static final String VNP_COMMAND = "pay";
    private static final String ORDER_TYPE = "other";

    public String createPaymentUrl(String txnRef, long amount, String orderInfo, String ipAddress) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", VNP_VERSION);
        params.put("vnp_Command", VNP_COMMAND);
        params.put("vnp_TmnCode", vnPayProperties.tmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay expects amount in smallest currency unit
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", ORDER_TYPE);
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnPayProperties.returnUrl());
        params.put("vnp_IpAddr", ipAddress);

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", now.format(formatter));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        // Build query string (sorted by key)
        String queryString = params.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII)
                        + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));

        // Compute HMAC-SHA512
        String secureHash = hmacSHA512(vnPayProperties.hashSecret(), queryString);

        return vnPayProperties.payUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyReturnSignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        // Rebuild query without vnp_SecureHash and vnp_SecureHashType
        Map<String, String> sorted = new TreeMap<>(params);
        sorted.remove("vnp_SecureHash");
        sorted.remove("vnp_SecureHashType");

        String queryString = sorted.entrySet().stream()
                .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII)
                        + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));

        String computedHash = hmacSHA512(vnPayProperties.hashSecret(), queryString);
        return computedHash.equalsIgnoreCase(receivedHash);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA512", e);
        }
    }
}
