package com.example.thanhcongvn.dto.response.video;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVideoResponse {
    private String id;
    private String productId;
    private String videoUrl;
    private String title;
    private Integer displayOrder;
}
