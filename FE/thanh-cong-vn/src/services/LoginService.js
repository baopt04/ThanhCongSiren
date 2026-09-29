import apiClient from "../api/client";
import { getRefreshToken, updateTokens } from "../utils/auth";

const API_ENDPOINT = "/auth";

export const createAccount = async (data) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/register`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating account:", error);
        throw error;
    }
};

export const login = async (loginData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/login`, loginData, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

export const refreshToken = async (token) => {
    try {
        const storedToken = token || getRefreshToken();
        const payload = storedToken ? { token: storedToken, refreshToken: storedToken } : {};

        let response;
        try {
            response = await apiClient.post(`${API_ENDPOINT}/refresh-token`, payload, {
                withCredentials: true,
            });
        } catch (err) {
            if (err.response?.status === 404) {
                response = await apiClient.post(`${API_ENDPOINT}/refresh`, payload, {
                    withCredentials: true,
                });
            } else {
                throw err;
            }
        }

        const resData = response.data?.data || response.data;
        if (resData?.accessToken) {
            updateTokens(resData.accessToken, resData.refreshToken || storedToken);
        }

        return response.data;
    } catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
};