package com.example.thanhcongvn.dto.request.bill;

import com.example.thanhcongvn.entity.enums.BillStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBillStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private BillStatus status;
    private String note;
}