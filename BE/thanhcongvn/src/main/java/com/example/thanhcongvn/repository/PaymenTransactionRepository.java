package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymenTransactionRepository extends JpaRepository<PaymentTransaction , String> {
}
