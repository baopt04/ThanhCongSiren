package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.BillDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BillDetailRepository extends JpaRepository<BillDetail , String > {
}
