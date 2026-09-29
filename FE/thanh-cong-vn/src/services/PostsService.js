import apiClient from "../api/client";
const API_ENDPOINT = "/admin/posts";

export const getAllPosts = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        console.log("Error getAll post", error);
        throw error;
    };
}
export const createPosts = async (data) => {
    try {
        const response = await apiClient.   post(`${API_ENDPOINT}/create`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const updatePosts = async (id, data) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/update/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deletePosts = async (id) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/delete/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const updateStauts = async (id, data) => {
    try {
        const response = await apiClient.patch(`${API_ENDPOINT}/changeStatus/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const updateImagePosts = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post(
            `${API_ENDPOINT}/upload-post-image`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error uploading post image:", error);
        throw error;
    }
};
export const deleteImagePosts = async (imageUrl) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/delete/image-post`, {
            params: { imageUrl },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting post image:", error);
        throw error;
    }       
}