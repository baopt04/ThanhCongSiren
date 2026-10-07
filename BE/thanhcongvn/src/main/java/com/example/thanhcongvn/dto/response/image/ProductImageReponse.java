package com.example.thanhcongvn.dto.response.image;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductImageReponse {
    private String id;
    private String productId;
    private String imageUrl;
    private String altText;
    private Integer isPrimary;
    private Integer displayOrder;

}
