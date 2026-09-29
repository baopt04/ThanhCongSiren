package com.example.thanhcongvn.controller.customer;

import com.example.thanhcongvn.dto.request.bill.CreateBillRequest;
import com.example.thanhcongvn.dto.response.customer.bill.BillResponse;
import com.example.thanhcongvn.dto.response.error.ApiFeResponse;
import com.example.thanhcongvn.repository.BillRepository;
import com.example.thanhcongvn.service.customer.CustomerBillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer/bills")
@RequiredArgsConstructor
public class CustomerBillController {
    private final CustomerBillService customerBillService;
    private final BillRepository billRepository;

    @PostMapping("/create")
    public ResponseEntity<ApiFeResponse<BillResponse>> create(@Valid @RequestBody CreateBillRequest request) {
        BillResponse response = customerBillService.create(request);

        return ResponseEntity.ok(
                ApiFeResponse.<BillResponse>builder()
                        .success(true)
                        .data(response)
                        .build()
        );
    }
}
