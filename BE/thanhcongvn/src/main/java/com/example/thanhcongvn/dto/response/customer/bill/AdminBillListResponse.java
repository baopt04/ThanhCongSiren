package com.example.thanhcongvn.dto.response.customer.bill;

import com.example.thanhcongvn.entity.enums.BillStatus;
import com.example.thanhcongvn.entity.enums.PaymentMethod;
import com.example.thanhcongvn.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminBillListResponse {
    private String id;
    private String billCode;
    private String shippingName;
    private String shippingPhone;
    private BigDecimal total;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BillStatus billStatus;
    private boolean registeredCustomer; // true nếu đơn của tài khoản, false nếu khách vãng lai
    private LocalDateTime createdAt;
}
