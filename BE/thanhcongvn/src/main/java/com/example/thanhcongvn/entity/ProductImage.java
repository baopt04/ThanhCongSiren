package com.example.thanhcongvn.entity;
import com.example.thanhcongvn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_images", indexes = {
        @Index(name = "idx_product_images_product", columnList = "id_product")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
    public class ProductImage  extends PrimaryEntity {

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "id_product", nullable = false)
        private Product product;

        /** Read-only FK — avoid loading Product entity just to get id when batching images. */
        @Column(name = "id_product", insertable = false, updatable = false)
        private String productId;

        @Column(name = "image_url", nullable = false)
        private String imageUrl;

        @Column(name = "alt_text")
        private String altText;

        @Column(name = "is_primary", columnDefinition = "TINYINT DEFAULT 0")
        private Integer isPrimary = 0;

        @Column(name = "display_order")
        private Integer displayOrder = 0;
}
