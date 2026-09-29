package com.example.thanhcongvn.entity;

import com.example.thanhcongvn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "address", indexes = {
        @Index(name = "idx_address_user", columnList = "id_users")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address extends PrimaryEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_users", nullable = false)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, length = 50)
    private String phone;

    @Column(nullable = false)
    private String street;

    private String ward;

    private String district;

    @Column(nullable = false)
    private String province;

    @Column(name = "province_id", nullable = false)
    private String province_id;
    @Column(name = "to_district_id", nullable = false)
    private String to_district_id;
    @Column(name = "ward_id", nullable = false)
    private String ward_id;
    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "is_default", columnDefinition = "TINYINT DEFAULT 0")
    private Integer isDefault = 0;

    @Column(name = "create_at", updatable = false)
    private LocalDateTime createAt;

    @PrePersist
    protected void onCreate() {
        createAt = LocalDateTime.now();
    }

}

