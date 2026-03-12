package com.example.thanhcongvn.dto.response.image;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageReponse {
    private String id;
    private String productId;
    private String imageUrl;
    private String altText;
    private Integer isPrimary;
    private Integer displayOrder;

}
