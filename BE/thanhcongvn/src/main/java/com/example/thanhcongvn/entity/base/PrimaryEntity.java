package com.example.thanhcongvn.entity.base;

import com.example.thanhcongvn.infrastructure.listener.CreatePrimaryEntityListener;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(CreatePrimaryEntityListener.class)
public abstract class PrimaryEntity
        implements IsIdentified {

    @Id
    @Column(length = 36, updatable = false)
    private String id;

}
