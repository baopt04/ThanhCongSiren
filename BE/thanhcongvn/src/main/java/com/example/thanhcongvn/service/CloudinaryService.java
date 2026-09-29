package com.example.thanhcongvn.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.thanhcongvn.config.CloudinaryConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {
    @Autowired
    private Cloudinary cloudinary;

    public Map<String, String> uploadImage(MultipartFile multipartFile) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    multipartFile.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "thanhcongvn-products"
                    )
            );
            Map<String , String> result = new HashMap<>();
            result.put("url", uploadResult.get("secure_url").toString());
            result.put("publicId", uploadResult.get("public_id").toString());
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Upload image failed");
        }

    }
    public Map<String, String> uploadVideo(MultipartFile multipartFile) {

        try {
            File tempFile = File.createTempFile("upload-", multipartFile.getOriginalFilename());
            multipartFile.transferTo(tempFile);

            Map uploadResult = cloudinary.uploader().upload(
                    tempFile,
                    ObjectUtils.asMap(
                            "resource_type", "video",
                            "folder", "thanhcongvn-products/video"
                    )
            );

            tempFile.delete();

            Map<String, String> result = new HashMap<>();
            result.put("url", uploadResult.get("secure_url").toString());
            result.put("publicId", uploadResult.get("public_id").toString());

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Upload Video failed: " + e.getMessage());
        }
    }

    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Delete image failed");
        }
    }
    public String extractPublicId(String imageUrl) {
        // Lấy phần sau "/upload/"
        String afterUpload = imageUrl.substring(imageUrl.indexOf("/upload/") + 8);

        // Bỏ phần version nếu có (vd: v1789397506/)
        if (afterUpload.matches("^v\\d+/.*")) {
            afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
        }

        // Bỏ đuôi file (.jpg, .png, ...)
        int lastDot = afterUpload.lastIndexOf(".");
        if (lastDot != -1) {
            afterUpload = afterUpload.substring(0, lastDot);
        }

        return afterUpload; // -> thanhcongvn-products/vmhu0uhxmqypxd1wig0q
    }
    public void deleteImageByImage(String imgUrl) throws Exception {
        String publicId = extractPublicId(imgUrl);
        try {
            Map result = cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("invalidate", true));
            String status = (String) result.get("result");
            if (!"ok".equals(status)) {
                throw new RuntimeException("Không tìm thấy ảnh hoặc xóa thất bại: " + status);
            }
        } catch (Exception e) {
            throw new RuntimeException("Delete image failed: " + e.getMessage());
        }
    }
}
