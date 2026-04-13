package com.movieapp.service;

import com.movieapp.dto.CreatePaymentRequest;
import com.movieapp.dto.PaymentDto;
import com.movieapp.entity.Payment;
import com.movieapp.entity.User;
import com.movieapp.exception.AppException;
import com.movieapp.repository.PaymentRepository;
import com.movieapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final VnPayService vnPayService;

    // Plan definitions: plan key -> (amount in VND, duration in days)
    private static final Map<String, long[]> PLANS = Map.of(
            "1month", new long[]{79000, 30},
            "3months", new long[]{199000, 90},
            "12months", new long[]{599000, 365}
    );

    public String createPayment(String username, CreatePaymentRequest request, String ipAddress) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new AppException("User not found"));

        long[] planInfo = PLANS.get(request.plan());
        if (planInfo == null) {
            throw new AppException("Invalid plan: " + request.plan());
        }

        long amount = planInfo[0];
        int durationDays = (int) planInfo[1];

        String txnRef = UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        String orderInfo = "Premium " + request.plan() + " - " + user.getUsername();

        Payment payment = Payment.builder()
                .user(user)
                .amount(amount)
                .orderInfo(orderInfo)
                .vnpTxnRef(txnRef)
                .status(Payment.STATUS_PENDING)
                .planDurationDays(durationDays)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        return vnPayService.createPaymentUrl(txnRef, amount, orderInfo, ipAddress);
    }

    @Transactional
    public Payment processVnPayReturn(Map<String, String> params) {
        if (!vnPayService.verifyReturnSignature(params)) {
            throw new AppException("Invalid VNPay signature");
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        Payment payment = paymentRepository.findByVnpTxnRef(txnRef)
                .orElseThrow(() -> new AppException("Payment not found: " + txnRef));

        // Prevent double processing
        if (!Payment.STATUS_PENDING.equals(payment.getStatus())) {
            return payment;
        }

        payment.setVnpResponseCode(responseCode);
        payment.setVnpTransactionNo(transactionNo);

        if ("00".equals(responseCode)) {
            // Payment success
            payment.setStatus(Payment.STATUS_SUCCESS);
            payment.setPaidAt(LocalDateTime.now());

            // Extend user premium
            User user = payment.getUser();
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime currentPremiumEnd = user.getPremiumUntil();

            // If already premium, extend from current end date; otherwise from now
            LocalDateTime startFrom = (currentPremiumEnd != null && currentPremiumEnd.isAfter(now))
                    ? currentPremiumEnd : now;
            user.setPremiumUntil(startFrom.plusDays(payment.getPlanDurationDays()));
            userRepository.save(user);
        } else {
            payment.setStatus(Payment.STATUS_FAILED);
        }

        return paymentRepository.save(payment);
    }

    public List<PaymentDto> getUserPayments(String username) {
        User user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new AppException("User not found"));
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    public Map<String, Object> getPlans() {
        return Map.of(
                "1month", Map.of("price", 79000, "days", 30, "label", "1 Tháng"),
                "3months", Map.of("price", 199000, "days", 90, "label", "3 Tháng"),
                "12months", Map.of("price", 599000, "days", 365, "label", "12 Tháng")
        );
    }

    private PaymentDto toDto(Payment p) {
        return new PaymentDto(
                p.getId(), p.getAmount(), p.getOrderInfo(),
                p.getStatus(), p.getPlanDurationDays(),
                p.getCreatedAt(), p.getPaidAt()
        );
    }
}
