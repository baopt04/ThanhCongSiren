package com.example.thanhcongvn.service.impl.customer;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
        Page<Product> productPage = productRepository.findAllWithCategory(pageable);

        List<String> productIds = productPage.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        // lấy toàn bộ ảnh của sản phẩm  trong trang và nhóm theo nhóm ID của sản phẩm
        Map<String, List<ProductImageReponse>> imagesByProductId =
                productImageRepository.findByProductIdIn(productIds).stream()
                        .collect(Collectors.groupingBy(
                                img -> img.getProduct().getId(),
                                Collectors.mapping(this::mapToImageResponse, Collectors.toList())
                        ));
        return productPage.map(product -> ListProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .image(imagesByProductId.getOrDefault(product.getId(), List.of()))
                .build());
    }

    @Override
    public ProductDetailResponse getProductDetailForId(String id) {
        Product product = productRepository.findDetailById(id).orElseThrow(
                () -> new AppException(ErrorCode.PRODUCT_NOT_FOUND)
        );
        List<ProductImageReponse> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(id)
                .stream().map(this::mapToImageResponse).collect(Collectors.toList());
        List<ProductSpecification> specs = productSpecificationRepository.findByProductIdOrderByDisplayOrderAsc(id);

        // Gom theo nhóm dữ liệu
        Map<String, List<ProductSpecificationResponse>> groupedSpecs = specs.stream()
                .collect(Collectors.groupingBy(
                        spec -> spec.getGroupName() != null ? spec.getGroupName() : "Khác",
                        LinkedHashMap::new,
                        Collectors.mapping(this::mapToSpecResponse, Collectors.toList())
                ));
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .isActive(product.getIsActive())
                .description(product.getDescription())
                .longDescription(product.getLongDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
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
        List<Product> products = productRepository.searchByKeyword(keyword.trim(), limit);

        if (products.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> productIds = products.stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<ProductImage> primaryImages = productImageRepository.findPrimaryImagesByProductIds(productIds);

        // Mỗi productId chỉ giữ lại 1 ảnh đầu tiên (đề phòng nhiều ảnh cùng isPrimary=1)
        Map<String, ProductImageReponse> imageByProductId = primaryImages.stream()
                .collect(Collectors.toMap(
                        img -> img.getProduct().getId(),
                        this::mapToImageResponse,
                        (existing, replacement) -> existing // nếu trùng, giữ ảnh lấy trước
                ));

        return products.stream()
                .map(product -> ProductSearchResponse.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .price(product.getPrice())
                        .images(imageByProductId.get(product.getId())) // có thể null nếu chưa có ảnh primary
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public Page<ListProductResponse> getByIdProductCategory(String slug, Pageable pageable) {
        Category category = categoryRepository.findBySlug(slug).orElseThrow(
                () -> new AppException(ErrorCode.CATEGORY_NOT_FOUND)
        );
        Page<Product> productPage = productRepository.findByCategoryId(category.getId(), pageable);
        List<String> productIds = productPage.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toList());
        Map<String, List<ProductImageReponse>> imagesProductId = productImageRepository.findByProductIdIn(productIds).stream()
                .collect(Collectors.groupingBy(
                        img -> img.getProduct().getId(),
                        Collectors.mapping(this::mapToImageResponse, Collectors.toList())
                ));
        return productPage.map(product -> ListProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .image(imagesProductId.getOrDefault(product.getId(), List.of()))
                .build());
    }

    @Override
    public List<HomeCategorySectionResponse> getHomeCategorySection(int productLimitCategory) {

        List<String> slugs = Arrays.asList(FEATURED_CATEGORY_SLUGS.split(","));

        List<Category> featuredParentCategories = categoryRepository.findBySlugIn(slugs);
        featuredParentCategories.sort(Comparator.comparingInt(c -> slugs.indexOf(c.getSlug())));

        return featuredParentCategories.stream()
                .map(parentCategory -> {
                    List<Category> childCategories = categoryRepository.findByParent_Id(parentCategory.getId());

                    List<String> categoryIds = new ArrayList<>();
                    categoryIds.add(parentCategory.getId());
                    childCategories.forEach(child -> categoryIds.add(child.getId()));

                    Pageable limit = PageRequest.of(0, productLimitCategory);

                    List<Product> products = productRepository
                            .findByCategory_IdInAndIsActive(categoryIds, 1, limit);

                    List<ListProductResponse> productResponses = products.stream()
                            .map(this::mapToProductResponse)
                            .collect(Collectors.toList());

                    return HomeCategorySectionResponse.builder()
                            .categoryId(parentCategory.getId())
                            .categoryName(parentCategory.getName())
                            .categorySlug(parentCategory.getSlug())
                            .products(productResponses)
                            .build();
                })
                .collect(Collectors.toList());
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

    private List<ProductImageReponse> mapImages(List<ProductImage> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }

        return images.stream()
                // Ảnh primary lên đầu, sau đó sắp theo displayOrder
                .sorted(Comparator
                        .comparing((ProductImage img) -> img.getIsPrimary() != null && img.getIsPrimary() == 1 ? 0 : 1)
                        .thenComparing(ProductImage::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(img -> ProductImageReponse.builder()
                        .id(img.getId())
                        .productId(img.getProduct().getId())
                        .imageUrl(img.getImageUrl())
                        .altText(img.getAltText())
                        .isPrimary(img.getIsPrimary())
                        .displayOrder(img.getDisplayOrder())
                        .build())
                .collect(Collectors.toList());
    }

    private ListProductResponse mapToProductResponse(Product product) {
        List<ProductImageReponse> images = mapImages(product.getImages());

        return ListProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .image(images)
                .build();
    }

}
