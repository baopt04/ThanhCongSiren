import apiClient from "../api/client";
const API_ENDPOINT = "/admin/users";

export const getAllUser = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};

export const createUsers = async (data) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};
export const createUser = createUsers;

export const updateUser = async (id, userData) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/update/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};
export const updateProduct = updateUser; // Backwards compatibility

export const deleteUser = async (id) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

export const findById = async (id) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
    }
};

export const lockUser = async (id) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${id}/toggle-status`);
        return response.data;
    } catch (error) {
        console.error("Error toggling user status:", error);
        throw error;
    }
};