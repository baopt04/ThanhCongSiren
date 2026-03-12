package com.example.thanhcongvn.dto.response.brand;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BrandResponse  {
    private String id;
    private String name;
    private String description;
    private Integer status;

}
