import apiClient from "../../api/client";
import { getCustomerUser } from "../../utils/auth";

const STORAGE_KEYS = {
  ORDERS: "tc_customer_orders",
  ADDRESSES: "tc_customer_addresses",
  PROFILE_EXTRA: "tc_customer_profile_extra",
};

/**
 * Lấy danh sách đơn hàng của khách hàng (API + LocalStorage thật, không seed mẫu)
 */
export async function getCustomerOrders() {
  let orders = [];
  try {
    const res = await apiClient.get("/customer/bills/my-bills");
    if (res?.data?.data && Array.isArray(res.data.data)) {
      orders = res.data.data;
    } else if (Array.isArray(res.data)) {
      orders = res.data;
    }
  } catch {
    console.info("[CustomerUserService] Sử dụng dữ liệu đơn hàng cục bộ");
  }

  let localOrders = [];
  try {
    const localRaw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (localRaw) {
      localOrders = JSON.parse(localRaw);
    }
  } catch {
    localOrders = [];
  }

  const combined = [...localOrders, ...orders];
  const uniqueMap = new Map();
  combined.forEach((o) => {
    if (o.orderId || o.id || o.code) {
      const key = o.orderId || o.id || o.code;
      uniqueMap.set(key, o);
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Lưu đơn hàng mới khi khách đặt hàng thành công
 */
export function saveLocalCustomerOrder(order) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
  } catch (e) {
    console.error("Lỗi khi lưu đơn hàng vào LocalStorage:", e);
  }
}

/**
 * Lấy danh sách địa chỉ nhận hàng của khách
 */
export function getCustomerAddresses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Thêm hoặc Cập nhật địa chỉ nhận hàng
 */
export function saveCustomerAddress(addressData) {
  const addresses = getCustomerAddresses();
  const isEdit = Boolean(addressData.id);

  let updatedList = [];
  if (isEdit) {
    updatedList = addresses.map((item) => {
      if (item.id === addressData.id) {
        return { ...item, ...addressData };
      }
      if (addressData.isDefault) {
        return { ...item, isDefault: false };
      }
      return item;
    });
  } else {
    const newAddr = {
      ...addressData,
      id: "addr-" + Date.now(),
      isDefault: addresses.length === 0 ? true : Boolean(addressData.isDefault),
    };
    if (newAddr.isDefault) {
      updatedList = addresses.map((a) => ({ ...a, isDefault: false }));
      updatedList.unshift(newAddr);
    } else {
      updatedList = [newAddr, ...addresses];
    }
  }

  localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedList));
  return updatedList;
}

/**
 * Xóa địa chỉ nhận hàng
 */
export function deleteCustomerAddress(addressId) {
  const addresses = getCustomerAddresses();
  let updatedList = addresses.filter((a) => a.id !== addressId);
  if (updatedList.length > 0 && !updatedList.some((a) => a.isDefault)) {
    updatedList[0].isDefault = true;
  }
  localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedList));
  return updatedList;
}

/**
 * Đặt làm địa chỉ mặc định
 */
export function setDefaultAddress(addressId) {
  const addresses = getCustomerAddresses();
  const updatedList = addresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));
  localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(updatedList));
  return updatedList;
}

/**
 * Lấy thông tin bổ sung của Profile
 */
export function getCustomerProfileExtra() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE_EXTRA);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Cập nhật hồ sơ người dùng
 */
export async function updateCustomerProfile(profileData) {
  try {
    await apiClient.put("/user/profile/update", profileData);
  } catch (err) {
    console.info("[CustomerUserService] Cập nhật profile qua API gặp sự cố, lưu cục bộ:", err.message);
  }

  const currentUser = getCustomerUser() || {};
  const updatedUser = {
    ...currentUser,
    fullName: profileData.fullName || currentUser.fullName,
    phone: profileData.phone || currentUser.phone,
    gender: profileData.gender || currentUser.gender,
    birthday: profileData.birthday || currentUser.birthday,
    avatar: profileData.avatar || currentUser.avatar,
  };

  localStorage.setItem("customerUser", JSON.stringify(updatedUser));
  localStorage.setItem(STORAGE_KEYS.PROFILE_EXTRA, JSON.stringify(profileData));

  window.dispatchEvent(new Event("customer-auth-changed"));
  return updatedUser;
}

/**
 * Đổi mật khẩu tài khoản
 */
export async function changeCustomerPassword(passwordData) {
  try {
    const res = await apiClient.post("/auth/change-password", passwordData);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) {
      try {
        const res2 = await apiClient.post("/customer/change-password", passwordData);
        return res2.data;
      } catch (err2) {
        throw err2;
      }
    }
    throw err;
  }
}
