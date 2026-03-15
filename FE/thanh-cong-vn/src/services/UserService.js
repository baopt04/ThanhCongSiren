import apiClient from "../api/client";
const API_ENDPOINT = "/users"

export const getAllUser = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);;
        return response.data;
    } catch (error) {
        throw error;
    };
}