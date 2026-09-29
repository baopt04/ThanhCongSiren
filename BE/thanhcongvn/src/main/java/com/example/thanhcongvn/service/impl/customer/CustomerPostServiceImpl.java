package com.example.thanhcongvn.service.impl.customer;

import com.example.thanhcongvn.dto.response.customer.category.ListCategoryCustomerReponse;
import com.example.thanhcongvn.dto.response.customer.categorynew.CategoryNewsCustomerResponse;
import com.example.thanhcongvn.dto.response.customer.post.ListPostCustomerResponse;
import com.example.thanhcongvn.entity.Post;
import com.example.thanhcongvn.entity.enums.PostStatus;
import com.example.thanhcongvn.repository.CategoryNewsRepository;
import com.example.thanhcongvn.repository.PostRepository;
import com.example.thanhcongvn.service.customer.CustomerPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerPostServiceImpl implements CustomerPostService {
    private final PostRepository postRepository;
    private final CategoryNewsRepository categoryNewsRepository;
    @Override
    public Page<ListPostCustomerResponse> getPublishedPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Post> posts = postRepository.findByStatusOrderByPublishedAtDesc(
                PostStatus.PUBLISHED, pageable);

        return posts.map(this::mapToResponse);

    }

    @Override
    public Page<ListPostCustomerResponse> getPublishedPostsByCategory(String categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Post> posts = postRepository.findByStatusAndCategory_IdOrderByPublishedAtDesc(
                PostStatus.PUBLISHED, categoryId, pageable);

        return posts.map(this::mapToResponse);
    }
    private ListPostCustomerResponse mapToResponse(Post post) {
        List<CategoryNewsCustomerResponse> categoryList = post.getCategory() != null
                ? List.of(CategoryNewsCustomerResponse.builder()
                .id(post.getCategory().getId())
                .name(post.getCategory().getName())
                .slug(post.getCategory().getSlug())
                .build())
                : Collections.emptyList();

        return ListPostCustomerResponse.builder()
                .id(post.getId())
                .categoryNews(categoryList)
                .title(post.getTitle())
                .slug(post.getSlug())
                .thumbnailUrl(post.getThumbnailUrl())
                .content(post.getContent())
                .status(post.getStatus().name()) // Enum -> String, vd: "PUBLISHED"
                .excerpt(post.getExcerpt())
                .publishedAt(post.getPublishedAt())
                .build();
    }
}
