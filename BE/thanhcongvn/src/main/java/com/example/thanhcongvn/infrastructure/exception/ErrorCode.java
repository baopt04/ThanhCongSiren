package com.example.thanhcongvn.infrastructure.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
public enum ErrorCode {
    // Common
    VALIDATION_ERROR(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ"),
    NOT_FOUND(404, "NOT_FOUND", "{resource} không tồn tại"),
    DUPLICATE(409, "DUPLICATE", "{resource} đã tồn tại"),
    UNAUTHORIZED(401, "UNAUTHORIZED", "Chưa xác thực"),
    FORBIDDEN(403, "FORBIDDEN", "Không có quyền truy cập"),
    INTERNAL_ERROR(500, "INTERNAL_ERROR", "Lỗi hệ thống"),

    // Business
    USER_NOT_FOUND(404, "USER_NOT_FOUND", "Người dùng không tồn tại"),
    EMAIL_DUPLICATED(409, "EMAIL_DUPLICATED", "Email đã được sử dụng"),
    BRAND_DUPLICATED(409 , "BRAND_DUPLICATED" , "Tên thương hiệu đã tồn tại"),
    BRAND_NOT_FOUND(404 , "BRAND_NOT_FOUND" , "Tên thương hiệu không tồn tại") ,
    WRONG_PASSWORD(400, "WRONG_PASSWORD", "Mật khẩu không đúng"),
    CATEGORY_NEWS(409 , "CATEGORY_NEW_DULICATED" , "Slug đã tồn tại") ,
    CATEGORY_NEWS_NOT_FOUND(404 , "CATEGORY_NEW_NOT_FOUND" , "Danh mục không tại"),
    CATEGORY_DUPLICATED(409 , "CATEGORY_DULICATED" , "Slug đã tồn tại") ,
    CATEGORY_PARENT_NOT_FOUND(404 , "CATEGORY_PARENT_NOT_FOUND" , "Danh mục cha không tồn tại") ,
    CATEGORY_NOT_FOUND(404 , "CATEGORY_NOT_FOUND" , "Danh mục không tại") ,
    CATEGORY_IN_USER(405 , "CATEGORY_IN_USER" , "Danh mục đang được sử dụng không thể xóa!") ,
    PRODUCT_OUT_OF_STOCK( 405 , "PRODUCT_OUT_OF_STOCK" , "Sản phẩm đã hết hàng") ,
    POST_SLUG(409 , "POST_SLUG" , "Slug đã tồn tại") ,
    POST_NOT_FOUND(404 , "POST_NOT_FOUND" , "Bài viết không tồn tại") ,
    SKU_DUPLICATED(409 , "SKY_DUPLICATED" , "Sku đã tồn tại") ,
    SLUG_DUPLICATED(409 , "SLUG_DUPLICATED" , "Slug đã tồn tại") ,
    PRODUCT_NOT_FOUND(404 , "PRODUCT_NOT_FOUND" , "Sản phẩm không tồn tại"),
    PRODUCT_PRICE_SALE(405 , "PRODUCT_PRICE" , "Giảm giá phải nhỏ hơn tiền sản phẩm") ,
    PRODUCT_STOCK(405 , "PRODUCT_STOCK" , "Tồn kho không được nhỏ hơn 0") ,
    PRODUCT_PRICE(405, "PRODUCT_PRICE" , "Giá sản phẩm phải lớn hơn 0"),
    INVALID_CREDENTIALS(401 , "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng"),
    USER_NOT_ACTIVE(423, "USER_NOT_ACTIVE", "Tài khoản đã bị khóa"),
    BILL_NOT_FOUND(404 , "BILL_NOT_FOUND", "Không tìm thấy đơn hàng"),
    INVALID_STATUS_TRANSITION(400 , "NOT_CHANGE_STATUS", "Không thể chuyển sang trạng thái này"),
    USE_CANCEL_API(400 , "CANCEL_BILL", "Vui lòng dùng chức năng hủy đơn (kèm lý do) để hủy hóa đơn"),
    CART_ITEM_NOT_FOUND(404, "PRODUCT_NOT_FOUND", "Sản phẩm không có trong giỏ hàng");
    private final int httpStatus;
    private final String message;
    private final String code;

    ErrorCode(int httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
