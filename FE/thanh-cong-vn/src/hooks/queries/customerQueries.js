import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../../config/queryClient";
import {
  getAllProductsForCustomer,
  getByProductForCategeroy,
  detailProductForId,
  categorySections,
} from "../../services/customer/CustomerProductService";
import { getAllCategoriesForCustomer } from "../../services/customer/CustomerCategoryService";
import { getAllPostsForCustomer } from "../../services/customer/CustomerPostService";

// ─── 1. CATEGORIES (DANH MỤC KHÁCH HÀNG) ──────────────────────
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
    gcTime: 60 * 60 * 1000,
  });
}

export function getCachedCategoriesDirect() {
  return queryClient.getQueryData(CATEGORIES_QUERY_KEY);
}

export function fetchCategoriesPromise() {
  return queryClient.fetchQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await getAllCategoriesForCustomer();
      const raw = res?.data || res?.result || res || [];
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 15 * 60 * 1000,
  });
}

// ─── 2. PRODUCTS PHÂN TRANG (TẤT CẢ SẢN PHẨM) ───────────────────
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
    gcTime: 15 * 60 * 1000,
    placeholderData: (previousData) => previousData, // Giữ trang cũ hiển thị mượt mà trong khi nạp trang mới
    ...options,
  });
}

/**
 * Prefetch trang sản phẩm kế tiếp (Next Page) ở background
 */
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

// ─── 3. SẢN PHẨM THEO DANH MỤC ─────────────────────────────────
export const categoryProductsQueryKey = (categoryId) => [
  "customer",
  "products",
  "category",
  categoryId,
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
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
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
    staleTime: 3 * 60 * 1000,
  });
}

// ─── 4. CHI TIẾT SẢN PHẨM (PRODUCT DETAIL) ──────────────────────
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
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    ...options,
  });
}

/**
 * Prefetch thông tin chi tiết sản phẩm khi người dùng di chuột (hover) vào card
 */
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

// ─── 5. TRANG CHỦ: SECTIONS SẢN PHẨM ────────────────────────────
export const HOME_SECTIONS_QUERY_KEY = ["customer", "home-sections"];

export function useHomeSectionsQuery() {
  return useQuery({
    queryKey: HOME_SECTIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await categorySections();
      const data = res?.data || (Array.isArray(res) ? res : []);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}

// ─── 6. BÀI VIẾT TIN TỨC (DÙNG CHUNG CHO NEWS, HOME & DETAIL) ───
export const NEWS_LIST_QUERY_KEY = ["customer", "posts"];

export function useCustomerPostsQuery() {
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
  });
}

/**
 * Lấy danh sách posts từ cache nếu đã có, tránh fetch lặp
 */
export function getCachedPostsDirect() {
  return queryClient.getQueryData(NEWS_LIST_QUERY_KEY);
}
