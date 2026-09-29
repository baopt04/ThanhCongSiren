import apiClient from "../api/client";

const API_ENDPOINT = "/admin/bill";

export const getAllBills = async (params = {}) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching bills:", error);
        throw error;
    }
};

export const detailBill = async (billId) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${billId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching bill details:", error);
        throw error;
    }
};

export const changeBillStatus = async (id, { status, note }) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/${id}/status`, { status, note });
        return response.data;
    } catch (error) {
        console.error("Error updating bill status:", error);
        throw error;
    }
};

export const changeBillPayment = async (id, paymentStatus) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/${id}/payment-status`, { paymentStatus });
        return response.data;
    } catch (error) {
        console.error("Error changing payment status:", error);
        throw error;
    }
};