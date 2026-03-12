package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.CartDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetail , String> {
}
