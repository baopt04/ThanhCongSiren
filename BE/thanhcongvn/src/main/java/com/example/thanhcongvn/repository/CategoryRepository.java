package com.example.thanhcongvn.repository;

import com.example.thanhcongvn.dto.projection.CategoryTreeView;
import com.example.thanhcongvn.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String slug);

    List<Category> findBySlugIn(List<String> slugs);

    List<Category> findByParent_Id(String parentId);

    @Query("""
            SELECT c FROM Category c
            LEFT JOIN FETCH c.parent
            WHERE c.parent.id IN :parentIds
            """)
    List<Category> findByParent_IdIn(@Param("parentIds") List<String> parentIds);

    @Query("""
            SELECT c.id AS id, c.name AS name, c.slug AS slug,
                   c.status AS status, p.id AS parentId
            FROM Category c
            LEFT JOIN c.parent p
            """)
    List<CategoryTreeView> findAllForTree();

}

