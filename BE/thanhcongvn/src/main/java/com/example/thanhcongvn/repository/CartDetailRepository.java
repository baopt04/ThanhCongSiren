package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.CartDetail;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartDetailRepository extends JpaRepository<CartDetail , String> {
    Optional<CartDetail> findByCartIdAndProductId(String cartId, String productId);

    @EntityGraph(attributePaths = {"product"})
    List<CartDetail> findByCartId(String cartId);

    void deleteByCartIdAndProductId(String cartId, String productId);
}
