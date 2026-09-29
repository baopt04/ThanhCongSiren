import apiClient from "../../api/client";
const API_ENDPOINT = "/customer/bills";

export const createBill = async (data) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/create`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating bill for customer", error);
        throw error;
    }
}