import { getAllCategoriesForCustomer as fetchCategoriesApi } from "../services/customer/CustomerCategoryService";
import { queryClient } from "../config/queryClient";

export const CATEGORIES_QUERY_KEY = ["customer", "categories"];

/**
 * Fetch danh mục tập trung qua TanStack Query cache:
 * Tái sử dụng 100% cùng 1 bộ nhớ cache trong RAM với useCustomerCategoriesQuery,
 * deduplicate toàn bộ các request song song giữa Header, RouteHandler, Sidebar.
 */
export async function getCachedCustomerCategories({ force = false } = {}) {
  if (!force) {
    const existing = queryClient.getQueryData(CATEGORIES_QUERY_KEY);
    if (existing && Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
  }

  return queryClient.fetchQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchCategoriesApi();
      const raw = res?.data || res?.result || res || [];
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function clearCustomerCategoriesCache() {
  queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEY });
}

/**
 * Tìm kiếm danh mục theo ID hoặc Slug trong cây danh mục (hỗ trợ nhiều cấp cha - con)
 */
export function findCategoryInTree(categories, identifier) {
  if (!identifier || identifier === "all" || !Array.isArray(categories)) return null;
  for (const cat of categories) {
    if (cat.id === identifier || cat.slug === identifier) {
      return cat;
    }
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryInTree(cat.children, identifier);
      if (found) return found;
    }
  }
  return null;
}
