package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken , String > {
}
