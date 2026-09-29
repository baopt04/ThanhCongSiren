package com.example.thanhcongvn.dto.response.customer.bill;

import com.example.thanhcongvn.entity.enums.BillStatus;
import com.example.thanhcongvn.entity.enums.PaymentMethod;
import com.example.thanhcongvn.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminBillDetailResponse {
    private String id;
    private String billCode;
    private String customerId; // null nếu khách vãng lai
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal total;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BillStatus billStatus;
    private String note;
    private LocalDateTime createdAt;
    private List<BillDetailResponse> billDetails;
    private List<BillStatusHistoryResponse> histories;
}