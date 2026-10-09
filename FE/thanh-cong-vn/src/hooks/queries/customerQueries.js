import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryClient } from "../../config/queryClient";
import {
  getAllProductsForCustomer,
  getByProductForCategeroy,
  detailProductForId,
  categorySections,
} from "../../services/customer/CustomerProductService";
import { getAllCategoriesForCustomer } from "../../services/customer/CustomerCategoryService";
import { getAllPostsForCustomer } from "../../services/customer/CustomerPostService";

// ══════════════════════════════════════════════════════════════
// NHÓM 1: DỮ LIỆU TĨNH / ÍT THAY ĐỔI (Categories, Home Sections)
// ══════════════════════════════════════════════════════════════

// 1.1 Cây danh mục khách hàng
export const CATEGORIES_QUERY_KEY = ["customer", "categories"];

export function useCustomerCategoriesQuery() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await getAllCategoriesForCustomer();
      const raw = res?.data || res?.result || res || [];
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 15 * 60 * 1000, // 15 phút không cần gọi lại
    gcTime: 60 * 60 * 1000,    // Giữ trong RAM 60 phút
  });
}

export function getCachedCategoriesDirect() {
  return queryClient.getQueryData(CATEGORIES_QUERY_KEY);
}

export function prefetchCustomerCategories() {
  return queryClient.prefetchQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await getAllCategoriesForCustomer();
      const raw = res?.data || res?.result || res || [];
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 15 * 60 * 1000,
  });
}

// 1.2 Sections sản phẩm trang chủ
export const HOME_SECTIONS_QUERY_KEY = ["customer", "home-sections"];

export function useHomeSectionsQuery() {
  return useQuery({
    queryKey: HOME_SECTIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await categorySections();
      const data = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000,
  });
}

export function prefetchHomeSections() {
  return queryClient.prefetchQuery({
    queryKey: HOME_SECTIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await categorySections();
      const data = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000,
  });
}


// ══════════════════════════════════════════════════════════════
// NHÓM 2: DANH SÁCH & CHI TIẾT (Products, Category Products, Posts)
// ══════════════════════════════════════════════════════════════

// 2.1 Tất cả sản phẩm phân trang
export const productListQueryKey = (page = 0, size = 12) => [
  "customer",
  "products",
  { page, size },
];

export function useCustomerProductsQuery(page = 0, size = 12, options = {}) {
  return useQuery({
    queryKey: productListQueryKey(page, size),
    queryFn: async () => {
      const res = await getAllProductsForCustomer({ page, size });
      return res;
    },
    staleTime: 3 * 60 * 1000, // 3 phút
    gcTime: 20 * 60 * 1000,
    placeholderData: keepPreviousData, // Giữ trang cũ hiển thị mượt mà khi đổi trang
    ...options,
  });
}

export function prefetchCustomerProductsPage(page, size = 12) {
  if (typeof page !== "number" || page < 0) return;
  return queryClient.prefetchQuery({
    queryKey: productListQueryKey(page, size),
    queryFn: async () => {
      const res = await getAllProductsForCustomer({ page, size });
      return res;
    },
    staleTime: 3 * 60 * 1000,
  });
}

// 2.2 Sản phẩm theo danh mục
export const categoryProductsQueryKey = (categoryId) => [
  "customer",
  "products",
  "category",
  String(categoryId),
];

export function useCategoryProductsQuery(categoryId, options = {}) {
  return useQuery({
    queryKey: categoryProductsQueryKey(categoryId),
    queryFn: async () => {
      if (!categoryId || categoryId === "all") return [];
      const res = await getByProductForCategeroy(categoryId);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    },
    enabled: Boolean(categoryId && categoryId !== "all"),
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 25 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function prefetchCategoryProducts(categoryId) {
  if (!categoryId || categoryId === "all") return;
  return queryClient.prefetchQuery({
    queryKey: categoryProductsQueryKey(categoryId),
    queryFn: async () => {
      const res = await getByProductForCategeroy(categoryId);
      const list = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// 2.3 Chi tiết sản phẩm
export const productDetailQueryKey = (productId) => [
  "customer",
  "product",
  String(productId),
];

export function useProductDetailQuery(productId, options = {}) {
  return useQuery({
    queryKey: productDetailQueryKey(productId),
    queryFn: async () => {
      if (!productId) return null;
      const res = await detailProductForId(productId);
      return res?.data || res;
    },
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}

export function prefetchProductDetail(productId) {
  if (!productId) return;
  return queryClient.prefetchQuery({
    queryKey: productDetailQueryKey(productId),
    queryFn: async () => {
      const res = await detailProductForId(productId);
      return res?.data || res;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// 2.4 Bài viết tin tức
export const NEWS_LIST_QUERY_KEY = ["customer", "posts"];

export function useCustomerPostsQuery(options = {}) {
  return useQuery({
    queryKey: NEWS_LIST_QUERY_KEY,
    queryFn: async () => {
      const res = await getAllPostsForCustomer();
      const rawList =
        res?.data?.content ||
        res?.data ||
        res?.content ||
        (Array.isArray(res) ? res : []);
      return Array.isArray(rawList) ? rawList : [];
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 20 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function prefetchCustomerPosts() {
  return queryClient.prefetchQuery({
    queryKey: NEWS_LIST_QUERY_KEY,
    queryFn: async () => {
      const res = await getAllPostsForCustomer();
      const rawList =
        res?.data?.content ||
        res?.data ||
        res?.content ||
        (Array.isArray(res) ? res : []);
      return Array.isArray(rawList) ? rawList : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function getCachedPostsDirect() {
  return queryClient.getQueryData(NEWS_LIST_QUERY_KEY);
}

// ══════════════════════════════════════════════════════════════
// 3. PREFETCH TRANG CHỦ & APP START (Chạy song song, không block UI)
// ══════════════════════════════════════════════════════════════
export function prefetchHomepageCriticalData() {
  prefetchCustomerCategories();
  prefetchHomeSections();
  prefetchCustomerPosts();
}
