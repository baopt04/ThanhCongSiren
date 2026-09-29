package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.service.TelegramService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TelegramNotificationSericeImpl implements TelegramService {
    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.chat-id}")
    private String chatId;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Async
    public void sendMessageTelegramBot(String message) {
        String url = String.format("https://api.telegram.org/bot%s/sendMessage", botToken);

        Map<String, Object> body = new HashMap<>();
        body.put("chat_id", chatId);
        body.put("text", message);
        body.put("parse_mode", "HTML"); // cho phép định dạng in đậm, nghiêng...

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            // Không nên để lỗi gửi Telegram làm crash luồng nghiệp vụ chính
            System.err.println("Gửi thông báo Telegram thất bại: " + e.getMessage());
        }
    }
}
