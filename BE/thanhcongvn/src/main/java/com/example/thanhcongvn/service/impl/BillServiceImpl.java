package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.bill.UpdateBillStatusRequest;
import com.example.thanhcongvn.dto.request.bill.UpdatePaymentStatusRequest;
import com.example.thanhcongvn.dto.response.customer.bill.AdminBillDetailResponse;
import com.example.thanhcongvn.dto.response.customer.bill.AdminBillListResponse;
import com.example.thanhcongvn.dto.response.customer.bill.BillDetailResponse;
import com.example.thanhcongvn.dto.response.customer.bill.BillStatusHistoryResponse;
import com.example.thanhcongvn.entity.*;
import com.example.thanhcongvn.entity.enums.BillStatus;
import com.example.thanhcongvn.entity.enums.PaymentMethod;
import com.example.thanhcongvn.entity.enums.PaymentStatus;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.BillRepository;
import com.example.thanhcongvn.repository.OrderStatusHistoryRepository;
import com.example.thanhcongvn.repository.UserRepository;
import com.example.thanhcongvn.service.BillService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {
    private final BillRepository billRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final UserRepository userRepository;
    private static final Map<BillStatus, Set<BillStatus>> ALLOWED_TRANSITIONS = Map.of(
            BillStatus.PENDING,   Set.of(BillStatus.CONFIRMED, BillStatus.CANCELLED),
            BillStatus.CONFIRMED, Set.of(BillStatus.SHIPPING, BillStatus.CANCELLED),
            BillStatus.SHIPPING,  Set.of(BillStatus.COMPLETED, BillStatus.CANCELLED),
            BillStatus.COMPLETED, Set.of(),
            BillStatus.CANCELLED, Set.of()
    );
    @Override
    @Transactional
    public Page<AdminBillListResponse> getAll(BillStatus status, PaymentStatus paymentStatus, String keyword, Pageable pageable) {
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return billRepository.search(status, paymentStatus, kw, pageable)
                .map(this::mapToListResponse);
    }

    @Override
    @Transactional
    public AdminBillDetailResponse getById(String id) {
        Bill bill = billRepository.findDetailById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
        return mapToDetailResponse(bill);
    }

    @Override
    public AdminBillDetailResponse updateStatus(String id, UpdateBillStatusRequest request) {
        Bill bill = billRepository.findDetailById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        BillStatus oldStatus = bill.getBillStatus();
        BillStatus newStatus = request.getStatus();

        if (!ALLOWED_TRANSITIONS.getOrDefault(oldStatus, Set.of()).contains(newStatus)) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
        }

        // Hủy đơn -> hoàn lại tồn kho (vì lúc tạo đơn đã trừ kho)
        if (newStatus == BillStatus.CANCELLED) {
            for (BillDetail detail : bill.getBillDetails()) {
                Product product = detail.getProduct();
                product.setStockQuantity(product.getStockQuantity() + detail.getQuantity());
            }
        }

        // Đơn COD giao thành công -> coi như đã thu tiền
        if (newStatus == BillStatus.COMPLETED && bill.getPaymentMethod() == PaymentMethod.COD) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        }

        bill.setBillStatus(newStatus);
        billRepository.save(bill);

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .bill(bill)
                .oldStatus(oldStatus.name())
                .newStatus(newStatus.name())
                .note(request.getNote())
                .changedBy(getCurrentUser())
                .build());

        return mapToDetailResponse(bill);
    }

    @Override
    public AdminBillDetailResponse updatePaymentStatus(String id, UpdatePaymentStatusRequest request) {
        Bill bill = billRepository.findDetailById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));

        bill.setPaymentStatus(request.getPaymentStatus());
        billRepository.save(bill);

        return mapToDetailResponse(bill);
    }



    private AdminBillDetailResponse mapToDetailResponse(Bill bill) {
        List<BillDetailResponse> details = bill.getBillDetails().stream()
                .map(d -> BillDetailResponse.builder()
                        .productId(d.getProduct().getId())
                        .productName(d.getProductName())
                        .productSku(d.getProductSku())
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .subtotal(d.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        List<BillStatusHistoryResponse> histories = orderStatusHistoryRepository
                .findByBillIdOrderByChangedAtDesc(bill.getId()).stream()
                .map(h -> BillStatusHistoryResponse.builder()
                        .oldStatus(h.getOldStatus() != null ? BillStatus.valueOf(h.getOldStatus()) : null)
                        .newStatus(BillStatus.valueOf(h.getNewStatus()))
                        .note(h.getNote())
                        .changedBy(h.getChangedBy() != null ? h.getChangedBy().getName() : null)
                        .createdAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        return AdminBillDetailResponse.builder()
                .id(bill.getId())
                .billCode(bill.getBillCode())
                .customerId(bill.getUser() != null ? bill.getUser().getId() : null)
                .shippingName(bill.getShippingName())
                .shippingPhone(bill.getShippingPhone())
                .shippingAddress(bill.getShippingAddress())
                .subtotal(bill.getSubtotal())
                .discountAmount(bill.getDiscountAmount())
                .shippingFee(bill.getShippingFee())
                .total(bill.getTotal())
                .paymentMethod(bill.getPaymentMethod())
                .paymentStatus(bill.getPaymentStatus())
                .billStatus(bill.getBillStatus())
                .note(bill.getNote())
                .createdAt(bill.getCreatedAt())
                .billDetails(details)
                .histories(histories)
                .build();
    }
    private AdminBillListResponse mapToListResponse(Bill bill) {
        return AdminBillListResponse.builder()
                .id(bill.getId())
                .billCode(bill.getBillCode())
                .shippingName(bill.getShippingName())
                .shippingPhone(bill.getShippingPhone())
                .total(bill.getTotal())
                .paymentMethod(bill.getPaymentMethod())
                .paymentStatus(bill.getPaymentStatus())
                .billStatus(bill.getBillStatus())
                .registeredCustomer(bill.getUser() != null)
                .createdAt(bill.getCreatedAt())
                .build();
    }
    private User getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
