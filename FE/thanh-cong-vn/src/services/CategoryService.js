import apiClient from "../api/client";
const API_ENDPOINT = "/admin/category";

export const getAllCategories = async (params = { size: 1000 }) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
export const createCategory = async (categoryData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/create`, categoryData);
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/update/${id}`, categoryData);
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};
export const findById = async (id) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        throw error;
    }
};
export const deleteCategory = async (id) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/delete/${id}`)
        return response.data;
    } catch (error) {
        throw error;
    }     
}

export const categoryTree = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/tree`);
        return response.data;
    } catch (error) {
        console.error("Error fetching category tree:", error);
        throw error;
    }
};