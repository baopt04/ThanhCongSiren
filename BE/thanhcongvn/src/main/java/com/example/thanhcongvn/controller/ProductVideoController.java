package com.example.thanhcongvn.controller;

import com.example.thanhcongvn.dto.response.video.ProductVideoResponse;
import com.example.thanhcongvn.service.ProductVideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-videos")
public class ProductVideoController {
    @Autowired
    private ProductVideoService videoService;
    @PostMapping(value = "/create/{productId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductVideoResponse> uploadVideo(
            @PathVariable String productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String title) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(videoService.uploadVideo(productId, file, title));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVideoResponse>> getByProduct(
            @PathVariable String productId) {

        return ResponseEntity.ok(videoService.getByProduct(productId));
    }
    @DeleteMapping("/delete/{videoId}")
    public ResponseEntity<Void> delete(@PathVariable String videoId) {

        videoService.deleteVideo(videoId);
        return ResponseEntity.ok().build();
    }
}
