package com.example.thanhcongvn.dto.request.address;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    private String phone;

    @NotBlank
    private String street;

    private String ward;

    private String district;

    @NotBlank
    private String province;

    private String postalCode;

    private Integer isDefault = 0;
}
