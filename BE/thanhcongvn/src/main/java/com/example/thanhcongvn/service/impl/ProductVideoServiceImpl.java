package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.response.video.ProductVideoResponse;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductVideo;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.repository.ProductVideoRepository;
import com.example.thanhcongvn.service.CloudinaryService;
import com.example.thanhcongvn.service.ProductVideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class ProductVideoServiceImpl implements ProductVideoService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVideoRepository videoRepository;
    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    public ProductVideoResponse uploadVideo(String productId, MultipartFile file, String title) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        Map<String, String> uploadResult =
                cloudinaryService.uploadVideo(file);

        ProductVideo video = ProductVideo.builder()
                .product(product)
                .videoUrl(uploadResult.get("url"))
                .title(title)
                .displayOrder(0)
                .build();

        videoRepository.save(video);

        return mapToResponse(video);
    }

    @Override
    public List<ProductVideoResponse> getByProduct(String productId) {
        return videoRepository.findByProductIdOrderByDisplayOrderAsc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteVideo(String videoId) {
        ProductVideo video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video không tồn tại"));

        // nên lưu public_id vào DB để xóa chính xác
        videoRepository.delete(video);
    }
    private ProductVideoResponse mapToResponse(ProductVideo video) {
        return ProductVideoResponse.builder()
                .id(video.getId())
                .productId(video.getProduct().getId())
                .videoUrl(video.getVideoUrl())
                .title(video.getTitle())
                .displayOrder(video.getDisplayOrder())
                .build();
    }
}
