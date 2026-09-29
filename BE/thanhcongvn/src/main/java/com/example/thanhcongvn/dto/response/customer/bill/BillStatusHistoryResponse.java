package com.example.thanhcongvn.dto.response.customer.bill;

import com.example.thanhcongvn.entity.enums.BillStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BillStatusHistoryResponse {
    private BillStatus oldStatus;
    private BillStatus newStatus;
    private String note;
    private String changedBy;
    private LocalDateTime createdAt;
}