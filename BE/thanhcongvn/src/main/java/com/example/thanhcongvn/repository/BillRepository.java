package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Bill;
import com.example.thanhcongvn.entity.enums.BillStatus;
import com.example.thanhcongvn.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {
    @EntityGraph(attributePaths = {"user"})
    @Query("""
        SELECT b FROM Bill b
        WHERE (:status IS NULL OR b.billStatus = :status)
          AND (:paymentStatus IS NULL OR b.paymentStatus = :paymentStatus)
          AND (:keyword IS NULL
               OR LOWER(b.billCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(b.shippingName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR b.shippingPhone LIKE CONCAT('%', :keyword, '%'))
        """)
    Page<Bill> search(@Param("status") BillStatus status,
                      @Param("paymentStatus") PaymentStatus paymentStatus,
                      @Param("keyword") String keyword,
                      Pageable pageable);

    @Query("""
        SELECT DISTINCT b FROM Bill b
        LEFT JOIN FETCH b.billDetails d
        LEFT JOIN FETCH d.product
        LEFT JOIN FETCH b.user
        WHERE b.id = :id
        """)
    Optional<Bill> findDetailById(@Param("id") String id);
}
