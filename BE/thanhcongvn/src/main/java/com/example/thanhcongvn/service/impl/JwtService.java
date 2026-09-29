package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.entity.User;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    @Value(("${jwt.secret}"))
    private String secretKey;
    @Value("${jwt.access-token-expiration}") // ví dụ: 900000 (15 phút, tính bằng ms)
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}") // ví dụ: 604800000 (7 ngày)
    private long refreshTokenExpiration;
    private static final String TOKEN_TYPE_ACCESS = "ACCESS";
    private static final String TOKEN_TYPE_REFRESH = "REFRESH";
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    private String generateToken(User user, long expiration , String tokenType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration   );
        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("type" , tokenType)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    public String generateAccessToken(User user) {
        return generateToken(user, accessTokenExpiration , TOKEN_TYPE_ACCESS);
    }
    public String generateRefreshToken(User user) {
        return generateToken(user, refreshTokenExpiration , TOKEN_TYPE_REFRESH);
    }
    public boolean isAccessToken(String token) {
        return TOKEN_TYPE_ACCESS.equals(extracAllClaims(token).get("type", String.class));
    }
    public boolean isRefreshTokenValid(String token) {
        try {
            Claims claims = extracAllClaims(token);
            return TOKEN_TYPE_REFRESH.equals(claims.get("type", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    public Date extractExpiration(String token) {
        return extracAllClaims(token).getExpiration();
    }

    private Claims extracAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public String extractUserId(String token) {
        return extracAllClaims(token).getSubject();
    }
}
