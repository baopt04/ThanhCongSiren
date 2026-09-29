package com.example.thanhcongvn.dto.request.bill;

import com.example.thanhcongvn.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateBillRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String shippingName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String shippingPhone;

    private String email; // nếu Bill entity chưa có field email, xem ghi chú bên dưới

    @NotBlank(message = "Địa chỉ không được để trống")
    private String shippingAddress;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    private Boolean requestInvoice; // yêu cầu xuất hóa đơn -> sẽ ghép vào note

    private String note; // ghi chú thêm của khách (nếu có)

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
    private List<OrderItemRequest> items;

    private BigDecimal shippingFee; // hoặc tự tính ở BE, xem ghi chú
    private BigDecimal discountAmount;
}
