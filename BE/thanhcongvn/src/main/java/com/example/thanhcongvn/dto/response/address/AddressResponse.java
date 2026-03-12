package com.example.thanhcongvn.dto.response.address;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private String id;

    private String fullName;
    private String phone;

    private String street;
    private String ward;
    private String district;
    private String province;
    private String postalCode;

    private Integer isDefault;

}
