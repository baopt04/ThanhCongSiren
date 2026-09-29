package com.example.thanhcongvn.dto.request.address;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(0|\\+84)[0-9]{9}$",
            message = "Số điện thoại không hợp lệ"
    )
    private String phone;

    @NotBlank(message = "Địa chỉ đường/phố không được để trống")
    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String street;

    @Size(max = 100, message = "Phường/xã không được vượt quá 100 ký tự")
    private String ward;

    @Size(max = 100, message = "Quận/huyện không được vượt quá 100 ký tự")
    private String district;

    @NotBlank(message = "Mã tỉnh/thành phố không được để trống")
    private String provinceId;

    @NotBlank(message = "Mã quận/huyện không được để trống")
    private String toDistrictId;

    @NotBlank(message = "Mã phường/xã không được để trống")
    private String wardId;

    @NotBlank(message = "Tỉnh/thành phố không được để trống")
    @Size(max = 100, message = "Tỉnh/thành phố không được vượt quá 100 ký tự")
    private String province;
    @Min(value = 0, message = "isDefault chỉ được phép là 0 hoặc 1")
    @Max(value = 1, message = "isDefault chỉ được phép là 0 hoặc 1")
    private Integer isDefault = 0;
}
