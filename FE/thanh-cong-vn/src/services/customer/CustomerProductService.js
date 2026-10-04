import apiClient from "../../api/client";
const API_ENDPOINT = "/customer/product";

// Module-level caches with TTL (3 phút)
const CACHE_TTL = 3 * 60 * 1000;

let _categorySectionsCache = null;
let _categorySectionsTime = 0;

const _productDetailCache = new Map();
const _categoryProductsCache = new Map();

export const getAllProductsForCustomer = async (params = {}) => {
    try {
        const queryParams = typeof params === "number" ? { page: params } : params;
        const response = await apiClient.get(`${API_ENDPOINT}`, { params: queryParams });
        return response.data;
    } catch (error) {
        console.log("Error getAll products for customer", error);
        throw error;
    };
};

export const detailProductForId = async (id, { force = false } = {}) => {
    const now = Date.now();
    if (!force && _productDetailCache.has(id)) {
        const cached = _productDetailCache.get(id);
        if (now - cached.time < CACHE_TTL) {
            return cached.data;
        }
    }
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/detail/${id}`);
        _productDetailCache.set(id, { data: response.data, time: now });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const searchProducts = async (keyword, signal = null) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/search`, {
            params: { keyword },
            signal: signal || undefined,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const searchCategoryBySlug = async (slug) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/category/${slug}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const categorySections = async ({ force = false } = {}) => {
    const now = Date.now();
    if (!force && _categorySectionsCache && (now - _categorySectionsTime) < CACHE_TTL) {
        return _categorySectionsCache;
    }
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/home/category-sections`);
        _categorySectionsCache = response.data;
        _categorySectionsTime = now;
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const notificationTelegramQuote = async (data) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/quote`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getByProductForCategeroy = async (idCategory, params = {}, { force = false } = {}) => {
    const queryParams = typeof params === "number" ? { page: params } : params;
    const hasParams = queryParams && Object.keys(queryParams).length > 0;
    const cacheKey = `${idCategory}_${JSON.stringify(queryParams || {})}`;
    const now = Date.now();

    if (!force && _categoryProductsCache.has(cacheKey)) {
        const cached = _categoryProductsCache.get(cacheKey);
        if (now - cached.time < CACHE_TTL) {
            return cached.data;
        }
    }

    try {
        const response = await apiClient.get(
            `${API_ENDPOINT}/${idCategory}/products`,
            hasParams ? { params: queryParams } : undefined
        );
        _categoryProductsCache.set(cacheKey, { data: response.data, time: now });
        return response.data;
    } catch (error) {
        console.error(`Error getByProductForCategeroy for category ${idCategory}:`, error);
        throw error;
    }
};

export const getByProductForCategory = getByProductForCategeroy;

export const clearCustomerProductCache = () => {
    _categorySectionsCache = null;
    _categorySectionsTime = 0;
    _productDetailCache.clear();
    _categoryProductsCache.clear();
};
