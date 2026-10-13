package com.example.thanhcongvn.infrastructure.listener;

public final class ImageUrls {
    private ImageUrls() {}
    public static String optimize(String url, int width) {
        if (url == null || !url.contains("/upload/")) return url;
        return url.replace("/upload/", "/upload/f_auto,q_auto,w_" + width + "/");
    }
}