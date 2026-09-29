import apiClient from "../api/client";
const API_ENDPOINT = "/admin/product-specifications";

export const getAllProductSpecs = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product specifications:", error);
        throw error;
    }
};
export const createProductSpec = async (specData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/create`, specData);
        return response.data;
    } catch (error) {
        console.error("Error creating product specification:", error);
        throw error;
    }
};
export const updateProductSpec = async (id, specData) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/${id}/update`, specData);
        return response.data;
    } catch (error) {
        console.error("Error updating product specification:", error);
        throw error;
    }
};
export const SpecsForProduct = async (productId) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching specifications for product:", error);
        throw error;
    }
};

export const deleteSpecs = async (id) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/delete/${id}`)
        return response.data;
    } catch (error) {
        throw error;
    }
}