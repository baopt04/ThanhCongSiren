package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.AuthToken;
import com.example.thanhcongvn.entity.enums.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken , String > {

    Optional<AuthToken> findByTokenAndTokenType(String token, TokenType tokenType);

    void deleteByUser_IdAndTokenType(String userId, TokenType tokenType);

    List<AuthToken> findByUser_IdAndTokenType(String userId, TokenType tokenType);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
