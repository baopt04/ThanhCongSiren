import { getAllCategoriesForCustomer as fetchCategoriesApi } from "../services/customer/CustomerCategoryService";

let cache = null;
let inflight = null;

/**
 * Fetch danh mục 1 lần, tái sử dụng cho Header / sidebar (tránh gọi API trùng).
 */
export async function getCachedCustomerCategories({ force = false } = {}) {
  if (!force && cache) return cache;
  if (!force && inflight) return inflight;

  inflight = fetchCategoriesApi()
    .then((res) => {
      cache = res;
      inflight = null;
      return res;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export function clearCustomerCategoriesCache() {
  cache = null;
  inflight = null;
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

