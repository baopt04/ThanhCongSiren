package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart , String> {
}
