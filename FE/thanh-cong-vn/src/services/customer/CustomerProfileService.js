import apiClient from "../../api/client";
const API_ENDPOINT = "/user/profile";

export const getProfile = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/get-profile`);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Không thể lấy thông tin hồ sơ");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error getting profile for customer", error);
        throw error;
    }
};

export const updateProfile = async (data) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/update`, data);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Cập nhật hồ sơ thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error updating profile for customer", error);
        throw error;
    }
};

export const changePassword = async (data) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/change-password`, data);
        const resData = response.data;
        if (resData && resData.success === false) {
            const error = new Error(resData.message || "Đổi mật khẩu thất bại");
            error.response = { data: resData };
            throw error;
        }
        return resData;
    } catch (error) {
        console.log("Error changing password for customer", error);
        throw error;
    }
};
