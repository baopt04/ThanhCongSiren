import apiClient from "../../api/client";
const API_ENDPOINT = "/customer/post";

export const getAllPostsForCustomer = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        console.log("Error getAll posts for customer", error);
        throw error;
    };
}