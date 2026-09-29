package com.example.thanhcongvn.dto.request.bill;

import com.example.thanhcongvn.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePaymentStatusRequest {
    @NotNull(message = "Trạng thái thanh toán không được để trống")
    private PaymentStatus paymentStatus;
}