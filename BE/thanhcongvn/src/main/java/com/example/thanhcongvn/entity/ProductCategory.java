package com.example.thanhcongvn.entity;

import com.example.thanhcongvn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_categories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id_product", "id_category"}),
        indexes = {
                @Index(name = "idx_pc_product", columnList = "id_product"),
                @Index(name = "idx_pc_category", columnList = "id_category")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCategory extends PrimaryEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_product")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_category")
    private Category category;
}