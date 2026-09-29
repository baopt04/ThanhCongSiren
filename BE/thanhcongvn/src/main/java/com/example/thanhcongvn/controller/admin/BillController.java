package com.example.thanhcongvn.controller.admin;

import com.example.thanhcongvn.dto.request.bill.UpdateBillStatusRequest;
import com.example.thanhcongvn.dto.request.bill.UpdatePaymentStatusRequest;
import com.example.thanhcongvn.dto.response.customer.bill.AdminBillDetailResponse;
import com.example.thanhcongvn.dto.response.customer.bill.AdminBillListResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.dto.response.pagination.PaginationResponse;
import com.example.thanhcongvn.entity.enums.BillStatus;
import com.example.thanhcongvn.entity.enums.PaymentStatus;
import com.example.thanhcongvn.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/admin/bill")
public class BillController {
    private final BillService billService;
    @GetMapping
    public ResponseEntity<ApiFeResponse<List<AdminBillListResponse>>> getAll(
            @RequestParam(required = false) BillStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<AdminBillListResponse> page = billService.getAll(status, paymentStatus, keyword, pageable);

        PaginationResponse pagination = PaginationResponse.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();

        return ResponseEntity.ok(
                ApiFeResponse.<List<AdminBillListResponse>>builder()
                        .success(true)
                        .data(page.getContent())
                        .pagination(pagination)
                        .build());
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiFeResponse<AdminBillDetailResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiFeResponse.<AdminBillDetailResponse>builder()
                        .success(true)
                        .data(billService.getById(id))
                        .build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiFeResponse<AdminBillDetailResponse>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateBillStatusRequest request) {
        return ResponseEntity.ok(
                ApiFeResponse.<AdminBillDetailResponse>builder()
                        .success(true)
                        .data(billService.updateStatus(id, request))
                        .build());
    }
    @PutMapping("/{id}/payment-status")
    public ResponseEntity<ApiFeResponse<AdminBillDetailResponse>> updatePaymentStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdatePaymentStatusRequest request) {
        return ResponseEntity.ok(
                ApiFeResponse.<AdminBillDetailResponse>builder()
                        .success(true)
                        .data(billService.updatePaymentStatus(id, request))
                        .build());
    }
}
