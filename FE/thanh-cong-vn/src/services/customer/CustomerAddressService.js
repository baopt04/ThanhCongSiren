import apiClient from "../../api/client";
const API_ENDPOINT = "/user/address";

export const getListAddress = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Không thể lấy danh sách địa chỉ");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error fetching address list for customer", error);
        throw error;
    }
};

export const createAddress = async (addressData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/create`, addressData);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Thêm địa chỉ thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error creating address for customer", error);
        throw error;
    }
};

export const updateAddress = async (addressId, addressData) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/${addressId}/update`, addressData);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Cập nhật địa chỉ thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error updating address for customer", error);
        throw error;
    }
};

export const deleteAddress = async (addressId) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/${addressId}/delete`);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Xóa địa chỉ thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error deleting address for customer", error);
        throw error;
    }
};

export const setDefaultAddress = async (addressId) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/${addressId}/default`);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Thiết lập địa chỉ mặc định thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error setting default address for customer", error);
        throw error;
    }
};