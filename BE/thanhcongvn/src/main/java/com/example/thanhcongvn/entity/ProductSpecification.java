package com.example.thanhcongvn.entity;
import com.example.thanhcongvn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_specifications", indexes = {
        @Index(name = "idx_product_specs_product", columnList = "id_product")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSpecification extends PrimaryEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;

    @Column(name = "spec_name", nullable = false)
    private String specName;

    @Column(name = "spec_value", nullable = false)
    private String specValue;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
