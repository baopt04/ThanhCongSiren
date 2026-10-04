import apiClient from "../../api/client";
const API_ENDPOINT = "/customer/post";

// Module-level cache — tránh gọi API lại khi chuyển giữa các bài viết
let _postsCache = null;
let _postsCacheTime = 0;
const POSTS_CACHE_TTL = 3 * 60 * 1000; // 3 phút

export const getAllPostsForCustomer = async ({ force = false } = {}) => {
    const now = Date.now();
    if (!force && _postsCache && (now - _postsCacheTime) < POSTS_CACHE_TTL) {
        return _postsCache;
    }
    try {
        const response = await apiClient.get(`${API_ENDPOINT}`);
        _postsCache = response.data;
        _postsCacheTime = now;
        return response.data;
    } catch (error) {
        console.log("Error getAll posts for customer", error);
        throw error;
    };
};

export const clearPostsCache = () => {
    _postsCache = null;
    _postsCacheTime = 0;
};