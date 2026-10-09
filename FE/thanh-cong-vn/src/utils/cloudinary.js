/**
 * Tối ưu hóa URL ảnh Cloudinary: tự động định dạng (f_auto),
 * chất lượng tự động (q_auto), và kích thước chiều rộng (w_${width}).
 *
 * @param {string} url - Đường dẫn ảnh
 * @param {number} [width] - Chiều rộng ảnh (px)
 * @returns {string} URL ảnh đã được tối ưu hoặc URL gốc nếu không hợp lệ
 */
export const optimizeCloudinary = (url, width) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("/upload/f_auto") || url.includes("/upload/w_")) return url;
    const transform = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
    return url.replace("/upload/", `/upload/${transform}/`);
  }
  return url;
};
