import apiClient from "../api/client";
import { getAllCategories } from "./CategoryService";

const API_ENDPOINT = "/admin/product";
const API_ENDPOINT_IMAGES = "/admin/product-images";
export const getAllProducts = async () => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};
export const createProduct = async (productData) => {
    try {
        const response = await apiClient.post(`${API_ENDPOINT}/create`, productData);
        return response.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};
export const updateProduct = async (id, productData) => {
    try {
        const response = await apiClient.put(`${API_ENDPOINT}/update/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};
export const findById = async (id) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
};

export const uploadProductImages = async (productId, images) => {
    try {
        const formData = new FormData();
        images.forEach((file) => formData.append("files", file));
        const response = await apiClient.post(`${API_ENDPOINT_IMAGES}/create/${productId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading product images:", error);
        throw error;
    }
};
export const getProductImages = async (productId) => {
    try {
        const response = await apiClient.get(`${API_ENDPOINT_IMAGES}/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product images:", error);
        throw error;
    }
};
export const deleteProductImage = async (imageId) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT_IMAGES}/delete/${imageId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting product image:", error);
        throw error;
    }
};
export const updateProductStatus = async (id) => {
    try {
        const response = await apiClient.patch(`${API_ENDPOINT}/${id}/active`);
        return response.data;
    } catch (error) {
        console.error("Error updating product status:", error);
        throw error;
    }
};
export const updateProductFeatured = async (id) => {
    try {
        const response = await apiClient.patch(`${API_ENDPOINT}/${id}/featured`);
        return response.data;
    } catch (error) {
        console.error("Error updating product featured status:", error);
        throw error;
    }
};
export const updateProductStock = async (id, quantity) => {
    try {
        const response = await apiClient.patch(`${API_ENDPOINT}/${id}/stock`, null, { params: { quantity } });
        return response.data;
    } catch (error) {
        console.error("Error updating product stock quantity:", error);
        throw error;
    }
};
export const updateProductPrice = async (id, price) => {
    try {
        const response = await apiClient.patch(`${API_ENDPOINT}/${id}/price`, null, { params: { price } });
        return response.data;
    }
    catch (error) {
        console.error("Error updating product sale price:", error);
        throw error;
    }
};

export const updateProductSalePrice = async (id, salePrice) => {
    try {
        const response = await apiClient.patch(`${API_ENDPOINT}/${id}/sale-price`, null, { params: { salePrice } });
        return response.data;
    }
    catch (error) {
        console.error("Error updating product sale price:", error);
        throw error;
    }
};

export const updateImageDescription = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post(
            `${API_ENDPOINT}/upload-description-image`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error uploading product image description:", error);
        throw error;
    }
};

export const deleteImageDescription = async (imageUrl) => {
    try {
        const response = await apiClient.delete(`${API_ENDPOINT}/delete/image-description`, {
            params: { imageUrl },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting product image description:", error);
        throw error;
    }
}