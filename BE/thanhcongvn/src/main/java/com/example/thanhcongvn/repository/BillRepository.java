package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillRepository extends JpaRepository<Bill , String > {
}
