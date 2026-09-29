package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.request.bill.UpdateBillStatusRequest;
import com.example.thanhcongvn.dto.request.bill.UpdatePaymentStatusRequest;
import com.example.thanhcongvn.dto.response.customer.bill.AdminBillDetailResponse;
import com.example.thanhcongvn.dto.response.customer.bill.AdminBillListResponse;
import com.example.thanhcongvn.entity.enums.BillStatus;
import com.example.thanhcongvn.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BillService {
    Page<AdminBillListResponse> getAll(BillStatus status, PaymentStatus paymentStatus, String keyword, Pageable pageable);
    AdminBillDetailResponse getById(String id);
    AdminBillDetailResponse updateStatus(String id, UpdateBillStatusRequest request);
    AdminBillDetailResponse updatePaymentStatus(String id, UpdatePaymentStatusRequest request);
}
