package com.example.thanhcongvn.service.customer;

import com.example.thanhcongvn.dto.request.bill.CreateBillRequest;
import com.example.thanhcongvn.dto.response.customer.bill.BillResponse;

public interface CustomerBillService {
    BillResponse create(CreateBillRequest request);
}
