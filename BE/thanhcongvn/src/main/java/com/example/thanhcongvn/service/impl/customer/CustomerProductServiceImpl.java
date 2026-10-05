package com.example.thanhcongvn.service.impl.customer;

import com.example.thanhcongvn.dto.projection.ProductCardView;
import com.example.thanhcongvn.dto.projection.ProductIdNamePriceView;
import com.example.thanhcongvn.dto.projection.ProductImageCardView;
import com.example.thanhcongvn.dto.projection.ProductSearchView;
import com.example.thanhcongvn.dto.response.customer.product.*;
import com.example.thanhcongvn.dto.response.image.ProductImageReponse;
import com.example.thanhcongvn.dto.response.specification.ProductSpecificationResponse;
import com.example.thanhcongvn.entity.Category;
import com.example.thanhcongvn.entity.Product;
import com.example.thanhcongvn.entity.ProductImage;
import com.example.thanhcongvn.entity.ProductSpecification;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.CategoryRepository;
import com.example.thanhcongvn.repository.ProductImageRepository;
import com.example.thanhcongvn.repository.ProductRepository;
import com.example.thanhcongvn.repository.ProductSpecificationRepository;
import com.example.thanhcongvn.service.customer.CustomerProductService;
import com.example.thanhcongvn.service.impl.TelegramNotificationSericeImpl;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CustomerProductServiceImpl implements CustomerProductService {
    @Value("${home.featured-categories}")
    private String FEATURED_CATEGORY_SLUGS;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductImageRepository productImageRepository;
    @Autowired
    private ProductSpecificationRepository productSpecificationRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private TelegramNotificationSericeImpl notificationSerice;

    @Override
    public Page<ListProductResponse> getAllProducts(Pageable pageable) {
        Page<ProductCardView> productPage = productRepository.findAllCards(pageable);

        Map<String, List<ProductImageReponse>> imagesByProductId =
                loadListImagesByProductIds(productPage.getContent().stream()
                        .map(ProductCardView::getId)
                        .collect(Collectors.toList()));

        return productPage.map(product -> ListProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .categoryId(product.getCategoryId())
                .categoryName(product.getCategoryName())
                .image(imagesByProductId.getOrDefault(product.getId(), List.of()))
                .build());
    }

    @Override
    public ProductDetailResponse getProductDetailForId(String id) {
        Product product = productRepository.findDetailById(id).orElseThrow(
                () -> new AppException(ErrorCode.PRODUCT_NOT_FOUND)
        );
        List<ProductImageReponse> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId())
                .stream().map(this::mapToImageResponse).collect(Collectors.toList());
        List<ProductSpecification> specs = productSpecificationRepository.findByProductIdOrderByDisplayOrderAsc(product.getId());

        Map<String, List<ProductSpecificationResponse>> groupedSpecs = specs.stream()
                .collect(Collectors.groupingBy(
                        spec -> spec.getGroupName() != null ? spec.getGroupName() : "Khác",
                        LinkedHashMap::new,
                        Collectors.mapping(this::mapToSpecResponse, Collectors.toList())
                ));
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .slug(product.getSlug())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .isActive(product.getIsActive())
                .description(product.getDescription())
                .longDescription(product.getLongDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)
                .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .images(images)
                .specifications(groupedSpecs)
                .build();
    }

    @Override
    public List<ProductSearchResponse> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        Pageable limit = PageRequest.of(0, 10);
        List<ProductSearchView> products = productRepository.searchCardsByKeyword(keyword.trim(), limit);

        if (products.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> productIds = products.stream()
                .map(ProductSearchView::getId)
                .collect(Collectors.toList());

        List<ProductImage> primaryImages = productImageRepository.findPrimaryImagesByProductIds(productIds);

        Map<String, ProductImageReponse> imageByProductId = primaryImages.stream()
                .collect(Collectors.toMap(
                        ProductImage::getProductId,
                        this::mapToImageResponse,
                        (existing, replacement) -> existing
                ));

        return products.stream()
                .map(product -> ProductSearchResponse.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .slug(product.getSlug())
                        .price(product.getPrice())
                        .images(imageByProductId.get(product.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Page<ListProductResponse> getByIdProductCategory(String slug, Pageable pageable) {
        Category category = categoryRepository.findBySlug(slug).orElseThrow(
                () -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)
        );
        List<String> categoryIds = new ArrayList<>();
        categoryIds.add(category.getId());

        Page<ProductCardView> productPage = productRepository.findCardsByCategoryIds(categoryIds, pageable);
        Map<String, List<ProductImageReponse>> imagesProductId =
                loadListImagesByProductIds(productPage.getContent().stream()
                        .map(ProductCardView::getId)
                        .collect(Collectors.toList()));

        return productPage.map(product -> ListProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .categoryId(product.getCategoryId() != null ? product.getCategoryId() : category.getId())
                .categoryName(product.getCategoryName() != null ? product.getCategoryName() : category.getName())
                .image(imagesProductId.getOrDefault(product.getId(), List.of()))
                .build());
    }

    @Override
    public List<HomeCategorySectionResponse> getHomeCategorySection(int productLimitCategory) {
        List<String> slugs = Arrays.asList(FEATURED_CATEGORY_SLUGS.split(","));

        List<Category> featuredParentCategories = categoryRepository.findBySlugIn(slugs);
        featuredParentCategories.sort(Comparator.comparingInt(c -> slugs.indexOf(c.getSlug())));

        if (featuredParentCategories.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> parentIds = featuredParentCategories.stream()
                .map(Category::getId)
                .collect(Collectors.toList());

        Map<String, List<Category>> childrenByParentId = categoryRepository.findByParent_IdIn(parentIds)
                .stream()
                .collect(Collectors.groupingBy(c -> c.getParent().getId()));

        Pageable limit = PageRequest.of(0, productLimitCategory);
        List<HomeCategorySectionResponse> sections = new ArrayList<>(featuredParentCategories.size());
        List<ProductCardView> allProducts = new ArrayList<>();
        Map<String, List<ProductCardView>> productsByParentId = new LinkedHashMap<>();

        for (Category parentCategory : featuredParentCategories) {
            List<String> categoryIds = new ArrayList<>();
            categoryIds.add(parentCategory.getId());
            childrenByParentId.getOrDefault(parentCategory.getId(), List.of())
                    .forEach(child -> categoryIds.add(child.getId()));

            List<ProductCardView> products = productRepository
                    .findCardsByCategoryIdsAndActive(categoryIds, 1, limit);
            productsByParentId.put(parentCategory.getId(), products);
            allProducts.addAll(products);
        }

        Map<String, List<ProductImageReponse>> imagesByProductId = loadListImagesByProductIds(
                allProducts.stream().map(ProductCardView::getId).distinct().collect(Collectors.toList()));

        for (Category parentCategory : featuredParentCategories) {
            List<ListProductResponse> productResponses = productsByParentId
                    .getOrDefault(parentCategory.getId(), List.of())
                    .stream()
                    .map(product -> ListProductResponse.builder()
                            .id(product.getId())
                            .name(product.getName())
                            .price(product.getPrice())
                            .categoryId(product.getCategoryId() != null
                                    ? product.getCategoryId()
                                    : parentCategory.getId())
                            .categoryName(product.getCategoryName() != null
                                    ? product.getCategoryName()
                                    : parentCategory.getName())
                            .image(imagesByProductId.getOrDefault(product.getId(), List.of()))
                            .build())
                    .collect(Collectors.toList());

            sections.add(HomeCategorySectionResponse.builder()
                    .categoryId(parentCategory.getId())
                    .categoryName(parentCategory.getName())
                    .categorySlug(parentCategory.getSlug())
                    .products(productResponses)
                    .build());
        }

        return sections;
    }

    @Override
    public QuoteResponse createQuote(QuoteResponse quote) {
        LocalDateTime now = LocalDateTime.now();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        String dateTime = now.format(formatter);

        String message = String.format(
                "🔔 <b>YÊU CẦU BÁO GIÁ MỚI</b>\n" +
                        "━━━━━━━━━━━━━━━━━━\n\n" +
                        "📅 <b>Thời gian:</b> %s\n\n" +

                        "👤 <b>Khách hàng</b>\n" +
                        "   └ Họ tên: %s\n" +
                        "   └ Số điện thoại: %s\n\n" +

                        "🏗️ <b>Thông tin công trình</b>\n" +
                        "   └ Loại dự án: %s\n\n" +

                        "📝 <b>Ghi chú</b>\n" +
                        "   └ %s\n\n" +

                        "━━━━━━━━━━━━━━━━━━\n" +
                        "📩 <i>Vui lòng liên hệ khách hàng để tư vấn.</i>",
                dateTime,
                quote.getName(),
                quote.getNumberPhone(),
                quote.getProject(),
                quote.getNote()
        );
        notificationSerice.sendMessageTelegramBot(message);
        return quote;
    }

    @Override
    @Transactional
    public Page<ListProductResponse> getProductsByCategory(String categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục"));

        Page<ProductIdNamePriceView> page = productRepository.findActiveCardsByCategoryId(categoryId, pageable);

        Map<String, List<ProductImageReponse>> imageMap = loadListImagesByProductIds(
                page.getContent().stream().map(ProductIdNamePriceView::getId).toList());

        return page.map(p -> ListProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .price(p.getPrice())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .image(imageMap.getOrDefault(p.getId(), List.of()))
                .build());
    }

    private Map<String, List<ProductImageReponse>> loadListImagesByProductIds(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Map.of();
        }
        return productImageRepository.findCardImagesByProductIds(productIds).stream()
                .collect(Collectors.groupingBy(
                        ProductImageCardView::getProductId,
                        Collectors.mapping(this::mapCardImage, Collectors.toList())
                ));
    }

    private ProductImageReponse mapCardImage(ProductImageCardView img) {
        return ProductImageReponse.builder()
                .imageUrl(img.getImageUrl())
                .isPrimary(img.getIsPrimary())
                .displayOrder(img.getDisplayOrder())
                .build();
    }

    private ProductImageReponse mapToImageResponse(ProductImage img) {
        return ProductImageReponse.builder()
                .id(img.getId())
                .imageUrl(img.getImageUrl())
                .altText(img.getAltText())
                .isPrimary(img.getIsPrimary())
                .displayOrder(img.getDisplayOrder())
                .build();
    }

    private ProductSpecificationResponse mapToSpecResponse(ProductSpecification spec) {
        return ProductSpecificationResponse.builder()
                .id(spec.getId())
                .specName(spec.getSpecName())
                .specValue(spec.getSpecValue())
                .displayOrder(spec.getDisplayOrder())
                .build();
    }

}
