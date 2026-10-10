import defaultCartImg from "../assets/images/projects/sapa-thuy-dien-360.webp";

/**
 * Utility quản lý giỏ hàng với LocalStorage
 */

const CART_KEY = "tc_cart";

/**
 * Lấy danh sách sản phẩm trong giỏ hàng từ LocalStorage
 */
export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Tự động chuẩn hóa dữ liệu giỏ hàng: nếu sku trước đây bị gán nhầm thành slug thì xóa slug khỏi sku
    return parsed.map((item) => {
      if (item.sku && item.slug && item.sku === item.slug) {
        return {
          ...item,
          sku: item.code || item.productCode || "",
        };
      }
      return item;
    });
  } catch (error) {
    console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
    return [];
  }
}

/**
 * Lưu giỏ hàng vào LocalStorage và bắn event để cập nhật Header / các component khác
 */
export function saveCart(cartItems) {
  try {
    const items = Array.isArray(cartItems) ? cartItems : [];
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("tc_cart_updated"));
  } catch (error) {
    console.error("Lỗi khi lưu giỏ hàng vào localStorage:", error);
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {Object} product - Thông tin sản phẩm
 * @param {number} quantity - Số lượng cần thêm
 */
export function addToCart(product, quantity = 1) {
  if (!product || !product.id) return [];

  const currentCart = getCart();
  const existingIndex = currentCart.findIndex((item) => item.id === product.id);

  // Lấy ảnh đại diện chính của sản phẩm
  let imageUrl = defaultCartImg;

  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find((img) => img.isPrimary === 1);
    imageUrl = primary?.imageUrl || product.images[0]?.imageUrl || imageUrl;
  } else if (Array.isArray(product.image) && product.image.length > 0) {
    const primary = product.image.find((img) => img.isPrimary === 1);
    imageUrl = primary?.imageUrl || product.image[0]?.imageUrl || imageUrl;
  } else if (product.thumbnailUrl) {
    imageUrl = product.thumbnailUrl;
  } else if (typeof product.image === "string" && product.image) {
    imageUrl = product.image;
  }

  // Lấy giá bán
  const numericPrice =
    typeof product.salePrice === "number" && product.salePrice > 0
      ? product.salePrice
      : typeof product.price === "number"
      ? product.price
      : 0;

  const validQty = Math.max(1, parseInt(quantity, 10) || 1);
  const rawSku = product.sku || product.productCode || product.code || "";
  const resolvedSku =
    rawSku && rawSku !== product.slug && rawSku !== product.id ? rawSku : "";

  let updatedCart;
  if (existingIndex > -1) {
    // Nếu sản phẩm đã có trong giỏ hàng thì cộng dồn số lượng
    updatedCart = currentCart.map((item, idx) =>
      idx === existingIndex
        ? {
            ...item,
            quantity: item.quantity + validQty,
            price: numericPrice || item.price,
            image: imageUrl || item.image,
            sku: resolvedSku || (item.sku !== item.slug ? item.sku : ""),
          }
        : item
    );
  } else {
    // Nếu sản phẩm chưa có thì thêm mới vào đầu danh sách
    const newItem = {
      id: product.id,
      name: product.name || "Sản phẩm",
      sku: resolvedSku,
      brand: product.brandName || "Lion King",
      warranty: "24 tháng",
      price: numericPrice,
      quantity: validQty,
      image: imageUrl,
      slug: product.slug || product.id,
    };
    updatedCart = [newItem, ...currentCart];
  }

  saveCart(updatedCart);
  return updatedCart;
}

/**
 * Cập nhật số lượng của một sản phẩm
 */
export function updateCartItemQty(productId, newQty) {
  const currentCart = getCart();
  const qty = parseInt(newQty, 10);
  if (isNaN(qty) || qty < 1) return currentCart;

  const updated = currentCart.map((item) =>
    item.id === productId ? { ...item, quantity: qty } : item
  );
  saveCart(updated);
  return updated;
}

/**
 * Xóa một sản phẩm khỏi giỏ hàng
 */
export function removeCartItem(productId) {
  const currentCart = getCart();
  const updated = currentCart.filter((item) => item.id !== productId);
  saveCart(updated);
  return updated;
}

/**
 * Xóa toàn bộ sản phẩm trong giỏ hàng
 */
export function clearCart() {
  saveCart([]);
  return [];
}

/**
 * Đếm tổng số lượng sản phẩm trong giỏ
 */
export function getCartTotalQuantity(cartItems) {
  const items = cartItems || getCart();
  return items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);
}

/**
 * Tính tổng tạm tính tiền giỏ hàng
 */
export function getCartSubtotal(cartItems) {
  const items = cartItems || getCart();
  return items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );
}
