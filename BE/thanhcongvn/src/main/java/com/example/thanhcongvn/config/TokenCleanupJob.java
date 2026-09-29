package com.example.thanhcongvn.config;

import com.example.thanhcongvn.repository.AuthTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class TokenCleanupJob {
    private final AuthTokenRepository authTokenRepository;
    @Scheduled(cron = "0 0 3 * * *") // chạy 3h sáng
        public void cleanExpiredTokens() {
         authTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        }
}
