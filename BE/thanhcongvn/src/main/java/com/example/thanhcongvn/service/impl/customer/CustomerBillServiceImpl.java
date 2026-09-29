package com.example.thanhcongvn.service.impl.customer;

import com.example.thanhcongvn.dto.request.bill.CreateBillRequest;
import com.example.thanhcongvn.dto.request.bill.OrderItemRequest;
import com.example.thanhcongvn.dto.response.customer.bill.BillDetailResponse;
import com.example.thanhcongvn.dto.response.customer.bill.BillResponse;
import com.example.thanhcongvn.entity.Bill;
import com.example.thanhcongvn.entity.BillDetail;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.User;
import com.example.thanhcongvn.entity.enums.BillStatus;
import com.example.thanhcongvn.entity.enums.PaymentStatus;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.BillRepository;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.repository.UserRepository;
import com.example.thanhcongvn.service.customer.CustomerBillService;
import jakarta.persistence.ManyToOne;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerBillServiceImpl implements CustomerBillService {
    private final ProductRepository productRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    @Override
    public BillResponse create(CreateBillRequest request) {
        StringBuilder noteBuilder = new StringBuilder();
//        if (Boolean.TRUE.equals(request.getRequestInvoice())) {
//            noteBuilder.append("[Yêu cầu xuất hóa đơn] ");
//        }
        if (request.getNote() != null && !request.getNote().isBlank()) {
            noteBuilder.append(request.getNote());
        }

        // Lấy thông tin sản phẩm từ ĐB
        List<String> productIds = request.getItems().stream()
                .map(OrderItemRequest::getProductId)
                .collect(Collectors.toList());
        Map<String, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, product -> product));
        if (productMap.size() != productIds.size()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        // Kieemre tra tồn kho + tính sub từng dòng
        List<BillDetail> billDetails = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest item : request.getItems()) {
            Product product = productMap.get(item.getProductId());

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }

            BigDecimal unitPrice;
            if (product.getSalePrice() != null && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0) {
                unitPrice = product.getSalePrice();
            } else {
                unitPrice = product.getPrice();
            }

            BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(lineSubtotal);

            BillDetail detail = BillDetail.builder()
                    .product(product)
                    .productName(product.getName())
                    .productSku(product.getSku())
                    .quantity(item.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(lineSubtotal)
                    .build();

            billDetails.add(detail);

            // Trừ tồn kho
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
        }
        // 4. Tính tổng tiền
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discountAmount).add(shippingFee);

        // 5. Tạo Bill
        User currentUser = getCurrentUser();
        Bill bill = Bill.builder()
                .billCode(generateBillCode())
                    .user(currentUser) // lấy user đang đăng nhập, xem ghi chú bên dưới
                .shippingName(request.getShippingName())
                .shippingPhone(request.getShippingPhone())
                .shippingAddress(request.getShippingAddress())
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .total(total)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.UNPAID)
                .billStatus(BillStatus.PENDING)
                .note(noteBuilder.toString())
                .build();

        // Gắn quan hệ 2 chiều để cascade lưu billDetails theo bill
        billDetails.forEach(details -> details.setBill(bill));
        bill.setBillDetails(billDetails);

        Bill savedBill = billRepository.save(bill);

        return mapToResponse(savedBill);

    }
    private String generateBillCode() {
        return "HĐ" + System.currentTimeMillis();
    }
    private BillResponse mapToResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .billCode(bill.getBillCode())
                .shippingName(bill.getShippingName())
                .shippingPhone(bill.getShippingPhone())
                .shippingAddress(bill.getShippingAddress())
                .subtotal(bill.getSubtotal())
                .discountAmount(bill.getDiscountAmount())
                .shippingFee(bill.getShippingFee())
                .total(bill.getTotal())
                .paymentMethod(bill.getPaymentMethod())
                .paymentStatus(bill.getPaymentStatus())
                .billStatus(bill.getBillStatus())
                .note(bill.getNote())
                .createdAt(bill.getCreatedAt())
                .billDetails(bill.getBillDetails().stream()
                        .map(d -> BillDetailResponse.builder()
                                .productId(d.getProduct().getId())
                                .productName(d.getProductName())
                                .productSku(d.getProductSku())
                                .quantity(d.getQuantity())
                                .unitPrice(d.getUnitPrice())
                                .subtotal(d.getSubtotal())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Chưa đăng nhập hoặc là anonymous user -> trả về null
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }

        String userId = authentication.getName();
        return userRepository.findById(userId).orElse(null);
    }
}
