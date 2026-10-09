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

/**
 * Tạo chuỗi srcSet cho ảnh Cloudinary với nhiều kích thước chiều rộng khác nhau.
 *
 * @param {string} url - Đường dẫn ảnh Cloudinary
 * @param {number[]} [widths=[200, 320, 480]] - Danh sách kích thước chiều rộng (px)
 * @returns {string|undefined} Chuỗi srcSet hoặc undefined nếu không phải URL Cloudinary
 */
export const cloudinarySrcSet = (url, widths = [200, 320, 480]) => {
  if (!url || typeof url !== "string") return undefined;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return undefined;

  // Xóa transform cũ nếu có để tạo transform sạch mới
  const baseUrl = url.replace(/\/upload\/(?:[a-zA-Z0-9_,-]+\/)?/, "/upload/");
  return widths
    .map((w) => `${baseUrl.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`)} ${w}w`)
    .join(", ");
};
