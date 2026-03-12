package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductImage;
import com.example.thanhcongvn.repository.ProductImageRepository;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.service.CloudinaryService;
import com.example.thanhcongvn.service.ProductImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class ProductImageServiceImpl implements ProductImageService {
    @Autowired
    private ProductImageRepository imageRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private Executor taskExecutor;

    @Override
    public ProductImageReponse uploadImage(String productId, MultipartFile file, String altText, Integer isPrimary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        Map<String, String> uploadResult = cloudinaryService.uploadImage(file);

        // Nếu set là primary → bỏ primary cũ
        if (isPrimary != null && isPrimary == 1) {
            imageRepository.findByProductIdAndIsPrimary(productId, 1)
                    .ifPresent(img -> img.setIsPrimary(0));
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(uploadResult.get("url"))
                .altText(altText)
                .isPrimary(isPrimary != null ? isPrimary : 0)
                .build();

        imageRepository.save(image);

        return mapToResponse(image);
    }

    @Override
    public List<ProductImageReponse> getByProduct(String productId) {
        return imageRepository.findByProductIdOrderByDisplayOrderAsc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteImage(String imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image không tồn tại"));

        // Lấy public_id từ url
        String publicId = extractPublicId(image.getImageUrl());

        cloudinaryService.deleteImage(publicId);

        imageRepository.delete(image);
    }

    @Override
    public void setPrimaryImage(String imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image không tồn tại"));

        imageRepository.findByProductIdAndIsPrimary(
                image.getProduct().getId(), 1
        ).ifPresent(img -> img.setIsPrimary(0));

        image.setIsPrimary(1);
    }

    @Override
    public List<ProductImageReponse> uploadMultiple(String productId, List<MultipartFile> files, String altText) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        List<CompletableFuture<ProductImageReponse>> futures = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {

            MultipartFile file = files.get(i);
            int displayOrder = i;

            CompletableFuture<ProductImageReponse> future =
                    CompletableFuture.supplyAsync(() -> {

                        Map<String, String> uploadResult =
                                cloudinaryService.uploadImage(file);

                        ProductImage image = ProductImage.builder()
                                .product(product)
                                .imageUrl(uploadResult.get("url"))
//                                .p(uploadResult.get("publicId"))
                                .altText(altText)
                                .isPrimary(displayOrder == 0 ? 1 : 0)
                                .displayOrder(displayOrder)
                                .build();

                        imageRepository.save(image);

                        return mapToResponse(image);

                    }, taskExecutor);

            futures.add(future);
        }
        return futures.stream()
                .map(CompletableFuture::join)
                .toList();
    }

    private ProductImageReponse mapToResponse(ProductImage image) {
        return ProductImageReponse.builder()
                .id(image.getId())
                .productId(image.getProduct().getId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .build();
    }

    private String extractPublicId(String url) {
        String[] parts = url.split("/");
        String fileName = parts[parts.length - 1];
        return "thanhcongvn-products/" + fileName.split("\\.")[0];
    }
}
