import apiClient from "../../api/client";
const API_ENDPOINT = "/user/cart";

export const getCartItems = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Không thể lấy thông tin giỏ hàng");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error fetching cart items for customer", error);
        throw error;
    }
};

export const createCartItem = async (data) => {
    try {
        const payload = {
            productId: data.productId,
            quantity: Number(data.quantity) || 1,
        };
        const response = await apiClient.post(`${API_ENDPOINT}/add`, payload);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Thêm sản phẩm vào giỏ hàng thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error creating cart item for customer", error);
        throw error;
    }
};

export const updateCartItem = async (itemId, data) => {
    try {
        const payload =
            typeof data === "object" && data !== null
                ? { quantity: String(data.quantity) }
                : { quantity: String(data) };
        const response = await apiClient.put(`${API_ENDPOINT}/${itemId}/update`, payload);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Cập nhật giỏ hàng thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error updating cart item for customer", error);
        throw error;
    }
};

export const deleteCartItem = async (itemId) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/${itemId}/delete`);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Xóa sản phẩm khỏi giỏ hàng thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error deleting cart item for customer", error);
        throw error;
    }
};
