import apiClient from "../../api/client";
const API_ENDPOINT = "/customer/categories";

export const getAllCategoriesForCustomer = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/tree`);
        return response.data;
    } catch (error) {
        console.log("Error getAll categories for customer", error);
        throw error;
    };
}