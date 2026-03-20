import apiClient from "../api/client";

const API_ENDPOINT = "/brand";

export const getAllBrands = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
};

export const createBrand = async (brandData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/create`, brandData);
        return response.data;
    } catch (error) {
        console.error("Error creating brand:", error);
        throw error;
    }
};

export const updateBrand = async (id, brandData) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/update/${id}`, brandData);
        return response.data;
    } catch (error) {
        console.error("Error updating brand:", error);
        throw error;
    }
};