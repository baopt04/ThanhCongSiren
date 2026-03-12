package com.example.thanhcongvn.service;

import com.example.thanhcongvn.dto.response.video.ProductVideoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductVideoService {
    ProductVideoResponse uploadVideo(String productId,
                                     MultipartFile file,
                                     String title);

    List<ProductVideoResponse> getByProduct(String productId);

    void deleteVideo(String videoId);
}
