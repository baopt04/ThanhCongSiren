import apiClient from "../api/client";
const API_ENDPOINT = "/users"

export const getAllUser = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        throw error;
    };
}

export const createUsers = async (data) => {
    try {
        const response = await apiClient.create(`${API_ENDPOINT}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const updateProduct = async (id, productData) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/update/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};
export const findById = async (id) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
};
export const lockUser = async (id) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${id}/toggle-status`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
};