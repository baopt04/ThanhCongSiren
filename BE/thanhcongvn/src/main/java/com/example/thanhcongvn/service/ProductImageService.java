package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    ProductImageReponse uploadImage(String productId,
                                    MultipartFile file,
                                    String altText,
                                    Integer isPrimary);

    List<ProductImageReponse> getByProduct(String productId);

    void deleteImage(String imageId);

    void setPrimaryImage(String imageId);

    List<ProductImageReponse> uploadMultiple(String productId,
                                             List<MultipartFile> files,
                                             String altText);
}
