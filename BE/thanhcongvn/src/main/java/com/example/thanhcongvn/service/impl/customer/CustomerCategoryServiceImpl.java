package com.example.thanhcongvn.service.impl.customer;

import com.example.thanhcongvn.dto.response.customer.category.ListCategoryCustomerResponse;
import com.example.thanhcongvn.entity.Category;
import com.example.thanhcongvn.repository.CategoryRepository;
import com.example.thanhcongvn.service.customer.CustomerCategorySerivce;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerCategoryServiceImpl implements CustomerCategorySerivce {
    private final CategoryRepository categoryRepository;

    @Override
    public List<ListCategoryCustomerResponse> getListCategoryTree() {
        List<Category> categoryTree = categoryRepository.findAll();
        Map<String , ListCategoryCustomerResponse> response = categoryTree.stream()
                .collect(Collectors.toMap(
                        Category::getId,
                        this::mapToResponseWithoutChildren
                ));
        List<ListCategoryCustomerResponse> listCategory = new ArrayList<>();
        for (Category category : categoryTree) {
            ListCategoryCustomerResponse categoryCustomerReponse = response.get(category.getId());
            String parentId = category.getParent() != null ? category.getParent().getId() : null;
            if (parentId == null) {
                listCategory.add(categoryCustomerReponse);
            } else {
                ListCategoryCustomerResponse parentCategoryResponse = response.get(parentId);
                if (parentCategoryResponse != null) {
                    if (parentCategoryResponse.getChildren() == null) {
                        parentCategoryResponse.setChildren(new ArrayList<>());
                    }
                        parentCategoryResponse.getChildren().add(categoryCustomerReponse);
                }
            }

        }
        return listCategory;
    }
    private ListCategoryCustomerResponse mapToResponseWithoutChildren(Category category) {
        return ListCategoryCustomerResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .status(category.getStatus())
                .description(category.getDescription())
                .createAt(category.getCreateAt())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(null) // sẽ gán sau nếu có con
                .build();
    }
}
