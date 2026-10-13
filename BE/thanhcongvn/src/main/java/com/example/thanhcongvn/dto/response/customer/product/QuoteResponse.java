package com.example.thanhcongvn.dto.response.customer.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuoteResponse {
    @NotBlank
    @Size(max = 100) private String name;
    @NotBlank @Pattern(regexp = "^[0-9+\\s.-]{8,15}$") private String numberPhone;
    @Size(max = 200) private String project;
    @Size(max = 1000) private String note;
}
