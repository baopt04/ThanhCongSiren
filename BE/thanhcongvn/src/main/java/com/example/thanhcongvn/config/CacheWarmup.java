package com.example.thanhcongvn.config;

import com.example.thanhcongvn.service.impl.customer.CustomerProductServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CacheWarmup {
    private final CustomerProductServiceImpl productService;

    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        try {
            productService.getHomeCategorySection(8);
            productService.getAllProducts(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")));
        } catch (Exception e) {
            log.warn("Warm-up bỏ qua: {}", e.getMessage());
        }
    }
}