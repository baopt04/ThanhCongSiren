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
