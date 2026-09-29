import apiClient from "../../api/client";
const API_ENDPOINT = "/customer/product";

export const getAllProductsForCustomer = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        console.log("Error getAll products for customer", error);
        throw error;
    };
}
export const detailProductForId = async (id) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/detail/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
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

}

export const searchCategoryBySlug = async (slug) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/category/${slug}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const categorySections = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/home/category-sections`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const notificationTelegramQuote = async (data) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/quote`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
