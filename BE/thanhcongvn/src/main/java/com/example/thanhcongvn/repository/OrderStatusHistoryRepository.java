package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory , String> {
    List<OrderStatusHistory> findByBillIdOrderByChangedAtDesc(String billId);
}
