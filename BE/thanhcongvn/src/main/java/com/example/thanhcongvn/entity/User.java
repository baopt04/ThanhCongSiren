package com.example.thanhcongvn.entity;

import com.example.thanhcongvn.entity.base.PrimaryEntity;
import com.example.thanhcongvn.entity.enums.Gender;
import com.example.thanhcongvn.entity.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_phone", columnList = "phone"),
        @Index(name = "idx_users_role", columnList = "role")
})
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class User extends PrimaryEntity implements UserDetails {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(nullable = false)
    private String password;

    @Column(name = "avatar_url")
    private String avatarUrl;
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('MALE','FEMALE','OTHER')")
    private Gender gender;
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('user','admin') DEFAULT 'user'")
    private UserRole role = UserRole.USER;

    @Column(columnDefinition = "TINYINT DEFAULT 1")
    private Integer status = 1;

    @Column(name = "is_verified", columnDefinition = "TINYINT DEFAULT 0")
    private Integer isVerified = 0;

    @Column(name = "create_at", updatable = false)
    private LocalDateTime createAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Address> addresses;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<AuthToken> authTokens;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Cart cart;

    @OneToMany(mappedBy = "user")
    private List<Bill> bills;

    @OneToMany(mappedBy = "user")
    private List<ProductReview> reviews;

    @OneToMany(mappedBy = "author")
    private List<Post> posts;

    @PrePersist
    protected void onCreate() {
        createAt = LocalDateTime.now();
        updateAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateAt = LocalDateTime.now();
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role != null ? List.of(new SimpleGrantedAuthority("ROLE_" + role.name())) : List.of();
    }

    @Override
    public String getUsername() {
        return this.getId();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
