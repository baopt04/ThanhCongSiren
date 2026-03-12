package com.example.thanhcongvn.entity;
import com.example.thanhcongvn.entity.base.PrimaryEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_videos", indexes = {
        @Index(name = "idx_product_videos_product", columnList = "id_product")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVideo extends PrimaryEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_product", nullable = false)
    private Product product;

    @Column(name = "video_url", nullable = false)
    private String videoUrl;

    private String title;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}

