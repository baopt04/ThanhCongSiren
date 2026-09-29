package com.example.thanhcongvn.controller.admin;

import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.example.thanhcongvn.service.ProductImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/product-images")
public class ProductImageController {
    @Autowired
    private ProductImageService imageService;

    @PostMapping("/{productId}")
    public ResponseEntity<ProductImageReponse> upload(
            @PathVariable String productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String altText,
            @RequestParam(required = false) Integer isPrimary) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageService.uploadImage(productId, file, altText, isPrimary));
    }

    @PostMapping(value = "/create/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ProductImageReponse>> uploadMultiple(
            @PathVariable String productId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(required = false) String altText) {

        List<ProductImageReponse> responses = imageService.uploadMultiple(productId, files, altText);

        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImageReponse>> getByProduct(
            @PathVariable String productId) {

        return ResponseEntity.ok(imageService.getByProduct(productId));
    }

    @DeleteMapping("/delete/{imageId}")
    public ResponseEntity<Void> delete(@PathVariable String imageId) {

        imageService.deleteImage(imageId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{imageId}/primary")
    public ResponseEntity<Void> setPrimary(@PathVariable String imageId) {

        imageService.setPrimaryImage(imageId);
        return ResponseEntity.ok().build();
    }
}
