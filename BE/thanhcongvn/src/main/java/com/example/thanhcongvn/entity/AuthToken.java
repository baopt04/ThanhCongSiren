package com.example.thanhcongvn.entity;
import com.example.thanhcongvn.entity.base.PrimaryEntity;
import com.example.thanhcongvn.entity.enums.TokenType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "auth_tokens", indexes = {
        @Index(name = "idx_token", columnList = "token"),
        @Index(name = "idx_token_type", columnList = "token_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthToken extends PrimaryEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_users", nullable = false)
    private User user;

    @Column(nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "token_type", nullable = false, columnDefinition = "ENUM('ACCESS','REFRESH','VERIFY','RESET_PASSWORD')")
    private TokenType tokenType;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }


}