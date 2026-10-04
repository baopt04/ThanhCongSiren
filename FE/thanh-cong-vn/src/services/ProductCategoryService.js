import apiClient from "../api/client";
const API_ENDPOINT = "/admin/product";

export const getProductCategories = async (idProduct) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${idProduct}/categories`);
        return response.data;
    } catch (error) {
        console.log("Error getAll product categories", error);
        throw error;
    };
}
export const addProductCategories = async (idProduct, data) => {
    try {
        const payload = Array.isArray(data) ? { categoryIds: data } : data;
        const response = await apiClient.post(`${API_ENDPOINT}/${idProduct}/categories`, payload);
        return response.data;
    } catch (error) {
        console.log("Error add product categories", error);
        throw error;
    };
}

export const updateProductCategories = async (idProduct, data) => {
    try {
        const payload = Array.isArray(data) ? { categoryIds: data } : data;
        const response = await apiClient.put(`${API_ENDPOINT}/${idProduct}/categories`, payload);
        return response.data;
    } catch (error) {
        console.log("Error update product categories", error);
        throw error;
    };
}

export const deleteProductCategories = async (idProduct, idCategory) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/${idProduct}/categories/${idCategory}`);
        return response.data;
    } catch (error) {
        console.log("Error delete product categories", error);
        throw error;
    };
}   