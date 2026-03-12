package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address , String > {

    List<Address> findByUserId(String userId);

    Optional<Address> findByIdAndUserId(String id, String userId);

    @Modifying
    @Query("UPDATE Address a SET a.isDefault = 0 WHERE a.user.id = :userId")
    void clearDefaultAddress(String userId);
}
