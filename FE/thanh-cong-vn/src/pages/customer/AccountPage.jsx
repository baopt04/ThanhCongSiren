import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  UserOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  LockOutlined,
  LogoutOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  CameraOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { message, Modal } from "antd";
import {
  getCustomerUser,
  clearCustomerAuth,
  isCustomerAuthenticated,
} from "../../utils/auth";
import {
  getCustomerOrders,
  getCustomerProfileExtra,
} from "../../services/customer/CustomerUserService";
import {
  getListAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../services/customer/CustomerAddressService";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../../services/customer/CustomerGhnService";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/customer/CustomerProfileService";
import {
  updateImagePosts,
  deleteImagePosts,
} from "../../services/PostsService";
import { addToCart } from "../../utils/cartUtils";
import { createCartItem } from "../../services/customer/CustomerCartService";
import "./AccountPage.css";
import { PLACEHOLDER_IMAGE } from '../../utils/placeholder';

const TAB_TITLES = {
  profile: "Hồ sơ của tôi",
  address: "Địa chỉ của tôi",
  orders: "Đơn mua",
  password: "Đổi mật khẩu",
};

/**
 * Hỗ trợ parse định dạng ngày sinh yyyy-dd-mm (backend yêu cầu)
 * và tự động thích ứng nếu BE trả ISO yyyy-mm-dd
 */
function parseBirthdayString(
  dateStr,
  fallback = { day: "15", month: "08", year: "1995" }
) {
  if (!dateStr || typeof dateStr !== "string") return fallback;

  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return fallback;

  const [year, p1, p2] = parts.map((v) => v.trim());

  const n1 = Number(p1);
  const n2 = Number(p2);

  if (
    !/^\d{4}$/.test(year) ||
    !Number.isInteger(n1) ||
    !Number.isInteger(n2)
  ) {
    return fallback;
  }

  // yyyy-MM-dd
  if (n1 >= 1 && n1 <= 12 && n2 >= 1 && n2 <= 31) {
    return {
      year,
      month: String(n1).padStart(2, "0"),
      day: String(n2).padStart(2, "0"),
    };
  }

  // yyyy-dd-MM
  if (n1 >= 1 && n1 <= 31 && n2 >= 1 && n2 <= 12) {
    return {
      year,
      month: String(n2).padStart(2, "0"),
      day: String(n1).padStart(2, "0"),
    };
  }

  return fallback;
}

export function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy tab từ query param ?tab=profile | address | orders | password
  const currentTab = searchParams.get("tab") || "profile";
  const setTab = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const [currentUser, setCurrentUser] = useState(() => getCustomerUser());
  const isAuthenticated = isCustomerAuthenticated();

  // ─── TAB 1: PROFILE STATES ─────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "MALE", // 'MALE' | 'FEMALE' | 'OTHER'
    birthDay: "15",
    birthMonth: "08",
    birthYear: "1995",
    avatar: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // ─── TAB 2: ADDRESS STATES ─────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    fullName: "",
    phone: "",
    provinceId: "",
    provinceName: "",
    toDistrictId: "",
    districtName: "",
    wardId: "",
    wardName: "",
    street: "",
    type: "home", // 'home' | 'office'
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // GHN Master Data States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // ─── TAB 3: ORDERS STATES ──────────────────────────────────
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearchKeyword, setOrderSearchKeyword] = useState("");
  const [detailOrderModal, setDetailOrderModal] = useState(null);

  // ─── TAB 4: PASSWORD STATES ────────────────────────────────
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdErrors, setPwdErrors] = useState({});
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSavingPwd, setIsSavingPwd] = useState(false);

  // Load User Data & Profile (kết hợp LocalStorage và API getProfile)
  useEffect(() => {
    let isMounted = true;
    const user = getCustomerUser();
    setCurrentUser(user);
    const extra = getCustomerProfileExtra();

    const initialBirth = parseBirthdayString(
      user?.birthday || extra?.birthday,
      { day: "15", month: "08", year: "1995" }
    );

    const rawGender = (user?.gender || extra?.gender || "MALE").toUpperCase();
    const validGender = ["MALE", "FEMALE", "OTHER"].includes(rawGender) ? rawGender : "MALE";

    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || extra?.phone || "",
        gender: validGender,
        birthDay: extra?.birthDay || initialBirth.day,
        birthMonth: extra?.birthMonth || initialBirth.month,
        birthYear: extra?.birthYear || initialBirth.year,
        avatar: user.avatar || extra?.avatar || "",
      });
    }

    // Tải thông tin hồ sơ mới nhất từ API backend nếu có
    const fetchLatestProfile = async () => {
      try {
        const res = await getProfile();
        const data = res?.data || res;
        if (isMounted && data && typeof data === "object") {
          const apiBirth = parseBirthdayString(data.birthday, initialBirth);
          const beGender = (data.gender || validGender).toUpperCase();
          setProfileForm((prev) => ({
            ...prev,
            fullName: data.fullName || data.fullNam || prev.fullName,
            email: data.email || prev.email,
            phone: data.phone || data.numberPhone || prev.phone,
            gender: ["MALE", "FEMALE", "OTHER"].includes(beGender) ? beGender : "MALE",
            birthDay: apiBirth.day,
            birthMonth: apiBirth.month,
            birthYear: apiBirth.year,
            avatar: data.avatar || prev.avatar,
          }));
        }
      } catch (e) {
        // Fallback nhẹ nhàng
      }
    };

    if (isAuthenticated) {
      fetchLatestProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Load GHN Provinces
  useEffect(() => {
    let isMounted = true;
    const fetchProvincesList = async () => {
      try {
        setLoadingProvinces(true);
        const res = await getProvinces();
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && Array.isArray(list)) {
          const sorted = [...list].sort((a, b) =>
            (a.ProvinceName || "").localeCompare(b.ProvinceName || "", "vi")
          );
          setProvinces(sorted);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách Tỉnh/Thành từ GHN:", err);
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    };
    fetchProvincesList();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Addresses from Backend
  const fetchAddressList = async () => {
    try {
      setLoadingAddresses(true);
      const res = await getListAddress();
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) {
        setAddresses(list);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách địa chỉ:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddressList();
    }
  }, [isAuthenticated]);

  // Load Orders
  useEffect(() => {
    if (isAuthenticated) {
      getCustomerOrders().then((list) => setOrders(list));
    }
  }, [isAuthenticated]);

  // Đăng xuất
  const handleLogout = () => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
      content: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?",
      okText: "Đăng xuất",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        clearCustomerAuth();
        message.success("Đã đăng xuất thành công!");
        navigate("/");
      },
    });
  };

  // ─── XỬ LÝ PROFILE ──────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input để có thể chọn lại cùng một file
    e.target.value = "";

    // Kiểm tra định dạng ảnh
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      message.error("Định dạng file không hợp lệ! Vui lòng chọn ảnh định dạng .JPG, .PNG hoặc .WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Kích thước file ảnh không được vượt quá 5 MB!");
      return;
    }

    const previousAvatar = profileForm.avatar;
    setIsUploadingAvatar(true);
    message.loading({ content: `Đang tải ảnh "${file.name}" lên Cloudinary...`, key: "upload_avatar" });

    try {
      // 1. Tải ảnh lên Cloudinary qua API updateImagePosts
      const res = await updateImagePosts(file);
      const newAvatarUrl =
        res?.data?.url ||
        res?.url ||
        (typeof res?.data === "string" ? res.data : null);

      if (!newAvatarUrl) {
        throw new Error("Không nhận được đường dẫn ảnh từ máy chủ");
      }

      // 2. Nếu đã có ảnh cũ trên Cloudinary (và khác ảnh mới), tiến hành xóa ảnh cũ bằng deleteImagePosts
      if (
        previousAvatar &&
        previousAvatar !== newAvatarUrl &&
        (previousAvatar.includes("cloudinary.com") || previousAvatar.includes("res.cloudinary"))
      ) {
        try {
          console.log("[AccountPage] Đang xóa ảnh đại diện cũ trên Cloudinary:", previousAvatar);
          await deleteImagePosts(previousAvatar);
        } catch (delErr) {
          console.warn("[AccountPage] Xóa ảnh đại diện cũ thất bại (ảnh có thể không còn tồn tại):", delErr);
        }
      }

      // 3. Cập nhật state form để hiển thị ngay
      setProfileForm((prev) => ({ ...prev, avatar: newAvatarUrl }));
      message.success({ content: "Tải ảnh đại diện thành công! Vui lòng bấm 'Lưu thay đổi' để hoàn tất.", key: "upload_avatar" });
    } catch (err) {
      console.error("[AccountPage] Lỗi khi tải ảnh đại diện lên Cloudinary:", err);
      message.error({
        content: err.response?.data?.message || err.message || "Tải ảnh đại diện thất bại. Vui lòng thử lại!",
        key: "upload_avatar",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = () => {
    if (!profileForm.avatar) return;
    const currentAvatar = profileForm.avatar;
    Modal.confirm({
      title: "Xác nhận gỡ ảnh đại diện",
      content: "Bạn có chắc chắn muốn gỡ ảnh đại diện hiện tại không?",
      okText: "Gỡ ảnh",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        if (currentAvatar.includes("cloudinary.com") || currentAvatar.includes("res.cloudinary")) {
          try {
            await deleteImagePosts(currentAvatar);
          } catch (delErr) {
            console.warn("[AccountPage] Lỗi khi xóa ảnh trên Cloudinary:", delErr);
          }
        }
        setProfileForm((prev) => ({ ...prev, avatar: "" }));
        message.success("Đã gỡ ảnh đại diện! Vui lòng bấm 'Lưu thay đổi' để hoàn tất.");
      },
    });
  };

  // ─── VALIDATE PROFILE ───────────────────────────────────────
  const validateProfile = () => {
    const newErrors = {};

    if (!profileForm.fullName || !profileForm.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên hoặc tên đơn vị.";
    } else if (profileForm.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có tối thiểu 2 ký tự.";
    }

    const cleanPhone = (profileForm.phone || "").replace(/[\s.-]/g, "");
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/;
    if (!cleanPhone) {
      newErrors.phone = "Vui lòng nhập số điện thoại liên hệ.";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 số, VD: 0904537559).";
    }

    // Validate logic ngày sinh
    const day = parseInt(profileForm.birthDay, 10);
    const month = parseInt(profileForm.birthMonth, 10);
    const year = parseInt(profileForm.birthYear, 10);
    if (!day || !month || !year) {
      newErrors.birthday = "Vui lòng chọn đầy đủ ngày, tháng, năm sinh.";
    } else {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        newErrors.birthday = `Tháng ${month} năm ${year} chỉ có ${daysInMonth} ngày.`;
      }
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!validateProfile()) {
      message.warning("Vui lòng kiểm tra lại các trường thông tin báo đỏ!");
      return;
    }

    const cleanPhone = (profileForm.phone || "").replace(/[\s.-]/g, "");
    const dayStr = String(profileForm.birthDay).padStart(2, "0");
    const monthStr = String(profileForm.birthMonth).padStart(2, "0");
    // BE format theo yêu cầu: yyyy-MM-dd
    const formattedBirthday = `${profileForm.birthYear}-${monthStr}-${dayStr}`;

    const genderLabels = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác / Doanh nghiệp",
    };

    const payload = {
      fullName: profileForm.fullName.trim(),
      birthday: formattedBirthday,
      gender: profileForm.gender || "MALE",
      phone: cleanPhone,
      avatar: profileForm.avatar || "",
    };

    Modal.confirm({
      title: "Xác nhận cập nhật hồ sơ",
      icon: <ExclamationCircleOutlined style={{ color: "#c8102e" }} />,
      centered: true,
      okText: "Xác nhận lưu",
      cancelText: "Kiểm tra lại",
      okButtonProps: {
        style: { background: "#c8102e", borderColor: "#c8102e" },
      },
      content: (
        <div style={{ marginTop: 8 }}>
          <p style={{ marginBottom: 10, color: "#475569", fontSize: 13 }}>
            Quý khách vui lòng kiểm tra lại thông tin hồ sơ trước khi lưu:
          </p>
          <div
            style={{
              background: "#f8fafc",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            {payload.avatar && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <strong style={{ color: "#334155" }}>🖼 Ảnh đại diện:</strong>{" "}
                <img
                  src={payload.avatar}
                  alt="Avatar"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>
            )}
            <div>
              <strong style={{ color: "#334155" }}>👤 Họ và tên:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.fullName}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>📞 Số điện thoại:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.phone}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>⚧ Giới tính:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{genderLabels[payload.gender]}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>🎂 Ngày sinh:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{`${dayStr}/${monthStr}/${profileForm.birthYear}`}</span>{" "}
              <span style={{ fontSize: 11, color: "#64748b" }}>({payload.birthday})</span>
            </div>
          </div>
        </div>
      ),
      async onOk() {
        setIsSavingProfile(true);
        try {
          const res = await updateProfile(payload);
          if (res && res.success === false) {
            const errMsg = res.message || "Cập nhật hồ sơ thất bại. Vui lòng thử lại!";
            message.error(errMsg);
            return;
          }

          message.success("Cập nhật thông tin hồ sơ thành công!");

          // Cập nhật auth storage để Header & Avatar đồng bộ tức thời
          const returnedUser = res?.data || {};
          const currentUser = getCustomerUser() || {};
          const updatedUser = {
            ...currentUser,
            fullName: payload.fullName,
            phone: payload.phone,
            gender: payload.gender,
            birthday: payload.birthday,
            avatar: payload.avatar,
            ...(typeof returnedUser === "object" ? returnedUser : {}),
          };
          localStorage.setItem("customerUser", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          window.dispatchEvent(new Event("customer-auth-changed"));
          setProfileErrors({});
        } catch (err) {
          console.error("Lỗi khi cập nhật hồ sơ:", err);
          message.error(err.response?.data?.message || err.message || "Cập nhật hồ sơ thất bại. Vui lòng thử lại!");
        } finally {
          setIsSavingProfile(false);
        }
      },
    });
  };

  // ─── XỬ LÝ ĐỊA CHỈ (GHN & BACKEND) ──────────────────────────
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressErrors({});
    setDistricts([]);
    setWards([]);
    setAddressFormData({
      fullName: currentUser?.fullName || "",
      phone: currentUser?.phone || profileForm.phone || "",
      provinceId: "",
      provinceName: "",
      toDistrictId: "",
      districtName: "",
      wardId: "",
      wardName: "",
      street: "",
      type: "home",
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = async (addr) => {
    setEditingAddress(addr);
    setAddressErrors({});

    const pId = addr.provinceId ? String(addr.provinceId) : "";
    const dId = addr.toDistrictId
      ? String(addr.toDistrictId)
      : addr.districtId
        ? String(addr.districtId)
        : "";
    const wId = addr.wardId
      ? String(addr.wardId)
      : addr.wardCode
        ? String(addr.wardCode)
        : "";

    setAddressFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      provinceId: pId,
      provinceName: addr.provinceName || addr.province || "",
      toDistrictId: dId,
      districtName: addr.district || addr.districtName || "",
      wardId: wId,
      wardName: addr.ward || addr.wardName || "",
      street: addr.street || addr.address || "",
      type: addr.type || "home",
      isDefault: addr.isDefault === 1 || addr.isDefault === true || addr.isDefault === "1",
    });
    setAddressModalOpen(true);

    // Tải trước quận huyện và phường xã theo dữ liệu cũ
    if (pId) {
      try {
        setLoadingDistricts(true);
        const distRes = await getDistricts(Number(pId));
        const distList = distRes?.data || (Array.isArray(distRes) ? distRes : []);
        setDistricts(Array.isArray(distList) ? distList : []);
      } catch (err) {
        console.error("Lỗi khi tải quận huyện:", err);
      } finally {
        setLoadingDistricts(false);
      }
    } else {
      setDistricts([]);
    }

    if (dId) {
      try {
        setLoadingWards(true);
        const wardRes = await getWards(Number(dId));
        const wardList = wardRes?.data || (Array.isArray(wardRes) ? wardRes : []);
        setWards(Array.isArray(wardList) ? wardList : []);
      } catch (err) {
        console.error("Lỗi khi tải phường xã:", err);
      } finally {
        setLoadingWards(false);
      }
    } else {
      setWards([]);
    }
  };

  const handleProvinceChange = async (e) => {
    const pId = e.target.value;
    const selectedProv = provinces.find((p) => String(p.ProvinceID) === String(pId));

    setAddressFormData((prev) => ({
      ...prev,
      provinceId: pId,
      provinceName: selectedProv ? selectedProv.ProvinceName : "",
      toDistrictId: "",
      districtName: "",
      wardId: "",
      wardName: "",
    }));
    setAddressErrors((prev) => ({ ...prev, provinceId: "", toDistrictId: "", wardId: "" }));
    setDistricts([]);
    setWards([]);

    if (!pId) return;

    try {
      setLoadingDistricts(true);
      const res = await getDistricts(Number(pId));
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) {
        const sorted = [...list].sort((a, b) =>
          (a.DistrictName || "").localeCompare(b.DistrictName || "", "vi")
        );
        setDistricts(sorted);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách Quận/Huyện từ GHN:", err);
      message.error("Không thể tải danh sách Quận/Huyện từ GHN");
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (e) => {
    const dId = e.target.value;
    const selectedDist = districts.find((d) => String(d.DistrictID) === String(dId));

    setAddressFormData((prev) => ({
      ...prev,
      toDistrictId: dId,
      districtName: selectedDist ? selectedDist.DistrictName : "",
      wardId: "",
      wardName: "",
    }));
    setAddressErrors((prev) => ({ ...prev, toDistrictId: "", wardId: "" }));
    setWards([]);

    if (!dId) return;

    try {
      setLoadingWards(true);
      const res = await getWards(Number(dId));
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (Array.isArray(list)) {
        const sorted = [...list].sort((a, b) =>
          (a.WardName || "").localeCompare(b.WardName || "", "vi")
        );
        setWards(sorted);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách Phường/Xã từ GHN:", err);
      message.error("Không thể tải danh sách Phường/Xã từ GHN");
    } finally {
      setLoadingWards(false);
    }
  };

  const handleWardChange = (e) => {
    const wId = e.target.value;
    const selectedWard = wards.find((w) => String(w.WardCode) === String(wId));

    setAddressFormData((prev) => ({
      ...prev,
      wardId: wId,
      wardName: selectedWard ? selectedWard.WardName : "",
    }));
    setAddressErrors((prev) => ({ ...prev, wardId: "" }));
  };

  const validateAddress = () => {
    const errors = {};
    if (!addressFormData.fullName || !addressFormData.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên người nhận.";
    } else if (addressFormData.fullName.trim().length < 2) {
      errors.fullName = "Họ và tên phải có tối thiểu 2 ký tự.";
    }

    const cleanPhone = (addressFormData.phone || "").replace(/[\s.-]/g, "");
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/;
    if (!cleanPhone) {
      errors.phone = "Vui lòng nhập số điện thoại người nhận.";
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = "Số điện thoại không hợp lệ (10-11 số, VD: 0912345678).";
    }

    if (!addressFormData.provinceId) {
      errors.provinceId = "Vui lòng chọn Tỉnh / Thành phố.";
    }
    if (!addressFormData.toDistrictId) {
      errors.toDistrictId = "Vui lòng chọn Quận / Huyện.";
    }
    if (!addressFormData.wardId) {
      errors.wardId = "Vui lòng chọn Phường / Xã.";
    }
    if (!addressFormData.street || !addressFormData.street.trim()) {
      errors.street = "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường...).";
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = () => {
    if (!validateAddress()) {
      message.warning("Vui lòng kiểm tra lại các trường thông tin địa chỉ báo đỏ!");
      return;
    }

    const cleanPhone = (addressFormData.phone || "").replace(/[\s.-]/g, "");
    const payload = {
      fullName: addressFormData.fullName.trim(),
      phone: cleanPhone,
      street: addressFormData.street.trim(),
      ward: addressFormData.wardName || "",
      district: addressFormData.districtName || "",
      provinceId: String(addressFormData.provinceId),
      toDistrictId: String(addressFormData.toDistrictId),
      wardId: String(addressFormData.wardId),
      isDefault: addressFormData.isDefault ? 1 : 0,
      province: addressFormData.provinceName || "",
      address: addressFormData.street.trim(),
    };

    const isEdit = Boolean(editingAddress);
    const targetId = editingAddress?.id || editingAddress?.addressId;

    Modal.confirm({
      title: isEdit ? "Xác nhận cập nhật địa chỉ" : "Xác nhận thêm địa chỉ mới",
      icon: <ExclamationCircleOutlined style={{ color: "#c8102e" }} />,
      centered: true,
      okText: isEdit ? "Cập nhật" : "Thêm mới",
      cancelText: "Kiểm tra lại",
      okButtonProps: { style: { background: "#c8102e", borderColor: "#c8102e" } },
      content: (
        <div style={{ marginTop: 8 }}>
          <p style={{ marginBottom: 10, color: "#475569", fontSize: 13 }}>
            Quý khách vui lòng kiểm tra lại thông tin địa chỉ:
          </p>
          <div
            style={{
              background: "#f8fafc",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            <div>
              <strong style={{ color: "#334155" }}>👤 Người nhận:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.fullName}</span> ({payload.phone})
            </div>
            <div>
              <strong style={{ color: "#334155" }}>📍 Địa chỉ cụ thể:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{payload.street}</span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>🏙 Khu vực:</strong>{" "}
              <span style={{ color: "#0f172a", fontWeight: 600 }}>
                {[payload.ward, payload.district, addressFormData.provinceName].filter(Boolean).join(", ")}
              </span>
            </div>
            <div>
              <strong style={{ color: "#334155" }}>⭐ Mặc định:</strong>{" "}
              <span style={{ color: payload.isDefault ? "#c8102e" : "#64748b", fontWeight: 600 }}>
                {payload.isDefault ? "Có (Địa chỉ mặc định)" : "Không"}
              </span>
            </div>
          </div>
        </div>
      ),
      async onOk() {
        setIsSavingAddress(true);
        try {
          if (isEdit) {
            await updateAddress(targetId, payload);
            message.success("Cập nhật địa chỉ thành công!");
          } else {
            await createAddress(payload);
            message.success("Thêm địa chỉ mới thành công!");
          }
          setAddressModalOpen(false);
          await fetchAddressList();
        } catch (err) {
          console.error("Lỗi khi lưu địa chỉ:", err);
          message.error(err.response?.data?.message || err.message || "Lưu địa chỉ thất bại. Vui lòng thử lại!");
        } finally {
          setIsSavingAddress(false);
        }
      },
    });
  };

  const handleDeleteAddress = (id) => {
    if (!id) {
      message.error("Không tìm thấy mã định danh địa chỉ để xóa!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa địa chỉ",
      icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
      content: "Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ của mình không? Thao tác này không thể hoàn tác.",
      okText: "Xóa địa chỉ",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await deleteAddress(id);
          message.success("Đã xóa địa chỉ thành công!");
          await fetchAddressList();
        } catch (err) {
          console.error("Lỗi khi xóa địa chỉ:", err);
          message.error(err.response?.data?.message || err.message || "Xóa địa chỉ không thành công. Vui lòng thử lại!");
        }
      },
    });
  };

  const handleSetDefaultAddress = (id) => {
    if (!id) {
      message.error("Không tìm thấy mã định danh địa chỉ!");
      return;
    }

    Modal.confirm({
      title: "Thiết lập địa chỉ mặc định",
      icon: <ExclamationCircleOutlined style={{ color: "#c8102e" }} />,
      content: "Bạn có chắc chắn muốn thiết lập địa chỉ này làm địa chỉ nhận hàng mặc định không?",
      okText: "Xác nhận thiết lập",
      cancelText: "Hủy",
      okButtonProps: { style: { background: "#c8102e", borderColor: "#c8102e" } },
      async onOk() {
        try {
          await setDefaultAddress(id);
          message.success("Đã thiết lập làm địa chỉ mặc định thành công!");
          await fetchAddressList();
        } catch (err) {
          console.error("Lỗi khi thiết lập địa chỉ mặc định:", err);
          message.error(err.response?.data?.message || err.message || "Thiết lập mặc định không thành công!");
        }
      },
    });
  };

  // ─── XỬ LÝ ĐƠN HÀNG ─────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    // Filter theo status tab
    if (orderFilter !== "all" && o.status !== orderFilter) return false;
    // Filter theo từ khóa
    if (orderSearchKeyword.trim()) {
      const kw = orderSearchKeyword.toLowerCase();
      const matchId = (o.orderId || o.code || "").toLowerCase().includes(kw);
      const matchItem = o.items?.some((it) => it.name?.toLowerCase().includes(kw));
      const matchName = (o.customerName || "").toLowerCase().includes(kw);
      return matchId || matchItem || matchName;
    }
    return true;
  });

  const handleReorder = async (order) => {
    if (order.items && order.items.length > 0) {
      try {
        if (isAuthenticated) {
          for (const item of order.items) {
            const pId = item.productId || item.id;
            const pQty = Number(item.quantity) || 1;
            await createCartItem({ productId: pId, quantity: pQty });
          }
          window.dispatchEvent(new Event("tc_cart_updated"));
        } else {
          order.items.forEach((item) => {
            addToCart(item, item.quantity || 1);
          });
        }
        message.success("Đã thêm các sản phẩm vào giỏ hàng thành công!");
        navigate("/gio-hang");
      } catch (err) {
        console.error("Lỗi khi mua lại đơn hàng:", err);
        message.error(
          err?.response?.data?.message ||
          err?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng!"
        );
      }
    }
  };

  // ─── XỬ LÝ ĐỔI MẬT KHẨU ─────────────────────────────────────
  const validatePassword = () => {
    const newErrors = {};

    if (!pwdForm.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (!pwdForm.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (pwdForm.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có tối thiểu 6 ký tự.";
    } else if (pwdForm.newPassword === pwdForm.currentPassword) {
      newErrors.newPassword = "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
    }

    if (!pwdForm.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu mới.";
    } else if (pwdForm.confirmPassword !== pwdForm.newPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu mới không trùng khớp.";
    }

    setPwdErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      message.warning("Vui lòng kiểm tra lại các trường mật khẩu!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận đổi mật khẩu",
      icon: <ExclamationCircleOutlined style={{ color: "#c8102e" }} />,
      centered: true,
      okText: "Xác nhận đổi",
      cancelText: "Hủy",
      okButtonProps: {
        style: { background: "#c8102e", borderColor: "#c8102e" },
      },
      content: (
        <div style={{ marginTop: 8 }}>
          <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn thay đổi mật khẩu của tài khoản này không?
          </p>
          <p style={{ color: "#c8102e", fontSize: 12, margin: "6px 0 0" }}>
            ⚠️ Sau khi đổi mật khẩu thành công, hệ thống sẽ tự động đăng xuất và yêu cầu bạn đăng nhập lại bằng mật khẩu mới.
          </p>
        </div>
      ),
      async onOk() {
        setIsSavingPwd(true);
        try {
          const payload = {
            currentPassword: pwdForm.currentPassword,
            newPassword: pwdForm.newPassword,
          };
          const res = await changePassword(payload);

          // Kiểm tra nếu BE trả về thành công: false
          if (res && res.success === false) {
            const errMsg = res.message || "Mật khẩu hiện tại không chính xác!";
            message.error(errMsg);
            setPwdErrors((prev) => ({
              ...prev,
              currentPassword: errMsg,
            }));
            return;
          }

          message.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.", 3);
          setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setPwdErrors({});

          // Đăng xuất: Xóa toàn bộ token & thông tin customer tại local
          clearCustomerAuth();
          navigate("/dang-nhap", { replace: true });
        } catch (err) {
          console.error("Lỗi khi đổi mật khẩu:", err);
          const errMsg =
            err.response?.data?.message ||
            err.message ||
            "Đổi mật khẩu không thành công. Vui lòng kiểm tra lại mật khẩu hiện tại!";
          message.error(errMsg);
          setPwdErrors((prev) => ({
            ...prev,
            currentPassword: errMsg,
          }));
        } finally {
          setIsSavingPwd(false);
        }
      },
    });
  };

  // Nếu chưa đăng nhập: Hiển thị thông báo thân thiện
  if (!isAuthenticated) {
    return (
      <div className="tc-account-page">
        <div className="tc-account-container">
          <div className="tc-account-content tc-empty-state" style={{ maxWidth: 580, margin: "40px auto" }}>
            <div className="tc-empty-icon">
              <LockOutlined style={{ color: "#c8102e" }} />
            </div>
            <h3 className="tc-empty-title">Bạn chưa đăng nhập vào hệ thống</h3>
            <p className="tc-empty-desc">
              Vui lòng đăng nhập để quản lý thông tin tài khoản, sổ địa chỉ và theo dõi trạng thái đơn mua.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link to="/dang-nhap" className="tc-empty-btn">
                Đăng nhập ngay
              </Link>
              <Link
                to="/dang-ky"
                className="tc-empty-btn"
                style={{ background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1" }}
              >
                Tạo tài khoản mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userInitial = (currentUser?.fullName || currentUser?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="tc-account-page">
      <div className="tc-account-container">
        {/* Breadcrumb */}
        <div className="tc-account-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/tai-khoan">Tài khoản</Link>
          <span>/</span>
          <span className="active">{TAB_TITLES[currentTab] || "Hồ sơ"}</span>
        </div>

        {/* Layout 2 cột: Sidebar trái (Shopee) + Nội dung phải */}
        <div className="tc-account-layout">
          {/* CỘT TRÁI: SIDEBAR */}
          <aside className="tc-account-sidebar">
            <div className="tc-account-user-card">
              <div className="tc-user-avatar-wrap">
                {currentUser?.avatar || profileForm.avatar ? (
                  <img src={currentUser?.avatar || profileForm.avatar} alt="Avatar" className="tc-user-avatar-img" />
                ) : (
                  <span className="tc-user-avatar-placeholder">{userInitial}</span>
                )}
              </div>
              <div className="tc-user-card-meta">
                <div className="tc-user-card-name" title={currentUser?.fullName || currentUser?.email}>
                  {currentUser?.fullName || currentUser?.email}
                </div>
                <button
                  type="button"
                  className="tc-user-card-edit-btn"
                  onClick={() => setTab("profile")}
                >
                  <EditOutlined /> Sửa hồ sơ
                </button>
              </div>
            </div>

            {/* Menu điều hướng */}
            <nav className="tc-account-nav">
              <div className="tc-nav-group-title" onClick={() => setTab("profile")}>
                <UserOutlined className="tc-nav-icon" />
                <span>Tài khoản của tôi</span>
              </div>
              <div className="tc-nav-sub-list">
                <span
                  className={`tc-nav-sub-item ${currentTab === "profile" ? "active" : ""}`}
                  onClick={() => setTab("profile")}
                >
                  Hồ sơ
                </span>
                <span
                  className={`tc-nav-sub-item ${currentTab === "address" ? "active" : ""}`}
                  onClick={() => setTab("address")}
                >
                  <span>Địa chỉ</span>
                  {addresses.length > 0 && (
                    <span style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 6px", borderRadius: 10, color: "#64748b" }}>
                      {addresses.length}
                    </span>
                  )}
                </span>
              </div>

              <div
                className={`tc-nav-link-item ${currentTab === "orders" ? "active" : ""}`}
                onClick={() => setTab("orders")}
              >
                <ShoppingOutlined className="tc-nav-icon" />
                <span>Đơn Mua</span>
                {orders.length > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: 11, background: "#fee2e2", color: "#c8102e", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                    {orders.length}
                  </span>
                )}
              </div>

              <div
                className={`tc-nav-link-item ${currentTab === "password" ? "active" : ""}`}
                onClick={() => setTab("password")}
              >
                <LockOutlined className="tc-nav-icon" />
                <span>Đổi Mật Khẩu</span>
              </div>

              {currentUser?.role === "ADMIN" && (
                <Link to="/admin" className="tc-nav-link-item" style={{ color: "#2563eb" }}>
                  <SafetyCertificateOutlined className="tc-nav-icon" style={{ color: "#2563eb" }} />
                  <span>Trang Quản Trị Admin</span>
                </Link>
              )}

              <div className="tc-nav-link-item tc-nav-logout-item" onClick={handleLogout}>
                <LogoutOutlined className="tc-nav-icon" />
                <span>Đăng Xuất</span>
              </div>
            </nav>
          </aside>

          {/* CỘT PHẢI: NỘI DUNG CHÍNH */}
          <main className="tc-account-content">
            {/* ═════════ TAB 1: HỒ SƠ CỦA TÔI ═════════ */}
            {currentTab === "profile" && (
              <div>
                <div className="tc-account-content-header">
                  <div className="tc-content-header-text">
                    <h2>Hồ Sơ Của Tôi</h2>
                    <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                  </div>
                </div>

                <div className="tc-profile-form-grid">
                  {/* Cột form bên trái */}
                  <form onSubmit={handleSaveProfile} className="tc-profile-fields">
                    {/* Tên đăng nhập / Email */}
                    <div className="tc-profile-row">
                      <label>Email đăng nhập</label>
                      <div className="tc-profile-input-wrap">
                        <span className="tc-profile-readonly-text">{profileForm.email || "---"}</span>
                        <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Email dùng để đăng nhập và nhận hóa đơn điện tử</span>
                      </div>
                    </div>

                    {/* Tên hiển thị */}
                    <div className="tc-profile-row">
                      <label>Họ và tên *</label>
                      <div className="tc-profile-input-wrap">
                        <input
                          type="text"
                          className={`tc-profile-input ${profileErrors.fullName ? "input-error" : ""}`}
                          value={profileForm.fullName}
                          placeholder="Nhập họ và tên hoặc tên đơn vị"
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, fullName: e.target.value });
                            if (profileErrors.fullName) setProfileErrors((prev) => ({ ...prev, fullName: "" }));
                          }}
                        />
                        {profileErrors.fullName && <span className="tc-field-error">{profileErrors.fullName}</span>}
                      </div>
                    </div>

                    {/* Số điện thoại */}
                    <div className="tc-profile-row">
                      <label>Số điện thoại *</label>
                      <div className="tc-profile-input-wrap">
                        <input
                          type="tel"
                          className={`tc-profile-input ${profileErrors.phone ? "input-error" : ""}`}
                          value={profileForm.phone}
                          placeholder="VD: 0904537559 hoặc 0865130088"
                          onChange={(e) => {
                            setProfileForm({ ...profileForm, phone: e.target.value });
                            if (profileErrors.phone) setProfileErrors((prev) => ({ ...prev, phone: "" }));
                          }}
                        />
                        {profileErrors.phone && <span className="tc-field-error">{profileErrors.phone}</span>}
                      </div>
                    </div>

                    {/* Giới tính */}
                    <div className="tc-profile-row">
                      <label>Giới tính *</label>
                      <div className="tc-gender-group">
                        <label className="tc-gender-label">
                          <input
                            type="radio"
                            name="gender"
                            value="MALE"
                            checked={profileForm.gender === "MALE"}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, gender: e.target.value });
                              if (profileErrors.gender) setProfileErrors((prev) => ({ ...prev, gender: "" }));
                            }}
                          />
                          Nam
                        </label>
                        <label className="tc-gender-label">
                          <input
                            type="radio"
                            name="gender"
                            value="FEMALE"
                            checked={profileForm.gender === "FEMALE"}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, gender: e.target.value });
                              if (profileErrors.gender) setProfileErrors((prev) => ({ ...prev, gender: "" }));
                            }}
                          />
                          Nữ
                        </label>
                        <label className="tc-gender-label">
                          <input
                            type="radio"
                            name="gender"
                            value="OTHER"
                            checked={profileForm.gender === "OTHER"}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, gender: e.target.value });
                              if (profileErrors.gender) setProfileErrors((prev) => ({ ...prev, gender: "" }));
                            }}
                          />
                          Khác / Doanh nghiệp
                        </label>
                      </div>
                    </div>

                    {/* Ngày sinh */}
                    <div className="tc-profile-row">
                      <label>Ngày sinh *</label>
                      <div className="tc-profile-input-wrap">
                        <div className="tc-birthday-selects">
                          {/* Ngày */}
                          <select
                            value={profileForm.birthDay}
                            className={profileErrors.birthday ? "input-error" : ""}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, birthDay: e.target.value });
                              if (profileErrors.birthday) setProfileErrors((prev) => ({ ...prev, birthday: "" }));
                            }}
                          >
                            {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                              <option key={d} value={d}>
                                Ngày {d}
                              </option>
                            ))}
                          </select>
                          {/* Tháng */}
                          <select
                            value={profileForm.birthMonth}
                            className={profileErrors.birthday ? "input-error" : ""}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, birthMonth: e.target.value });
                              if (profileErrors.birthday) setProfileErrors((prev) => ({ ...prev, birthday: "" }));
                            }}
                          >
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                              <option key={m} value={m}>
                                Tháng {m}
                              </option>
                            ))}
                          </select>
                          {/* Năm */}
                          <select
                            value={profileForm.birthYear}
                            className={profileErrors.birthday ? "input-error" : ""}
                            onChange={(e) => {
                              setProfileForm({ ...profileForm, birthYear: e.target.value });
                              if (profileErrors.birthday) setProfileErrors((prev) => ({ ...prev, birthday: "" }));
                            }}
                          >
                            {Array.from({ length: 70 }, (_, i) => String(2020 - i)).map((y) => (
                              <option key={y} value={y}>
                                Năm {y}
                              </option>
                            ))}
                          </select>
                        </div>
                        {profileErrors.birthday && <span className="tc-field-error">{profileErrors.birthday}</span>}
                      </div>
                    </div>

                    {/* Nút Lưu */}
                    <button type="submit" className="tc-profile-save-btn" disabled={isSavingProfile}>
                      {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </form>

                  {/* Cột đổi ảnh đại diện bên phải */}
                  <div className="tc-profile-avatar-col">
                    <div className="tc-big-avatar-preview" style={{ position: "relative" }}>
                      {profileForm.avatar ? (
                        <img src={profileForm.avatar} alt="Avatar" className="tc-big-avatar-img" />
                      ) : (
                        <span className="tc-big-avatar-placeholder">{userInitial}</span>
                      )}
                      {isUploadingAvatar && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 22,
                          }}
                        >
                          <LoadingOutlined spin />
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                      <label
                        className="tc-avatar-upload-btn"
                        style={{
                          margin: 0,
                          opacity: isUploadingAvatar ? 0.6 : 1,
                          cursor: isUploadingAvatar ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {isUploadingAvatar ? (
                          <>
                            <LoadingOutlined spin /> Đang tải...
                          </>
                        ) : (
                          <>
                            <CameraOutlined /> Chọn ảnh
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          style={{ display: "none" }}
                          onChange={handleAvatarChange}
                          disabled={isUploadingAvatar}
                        />
                      </label>
                      {profileForm.avatar && !isUploadingAvatar && (
                        <button
                          type="button"
                          onClick={handleDeleteAvatar}
                          title="Gỡ ảnh đại diện"
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #fecaca",
                            background: "#fff1f2",
                            color: "#dc2626",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 13,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <DeleteOutlined /> Gỡ
                        </button>
                      )}
                    </div>
                    <span className="tc-avatar-guideline">
                      Dung lượng file tối đa 5 MB. Định dạng: .JPEG, .PNG, .WEBP
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ TAB 2: ĐỊA CHỈ NHẬN HÀNG ═════════ */}
            {currentTab === "address" && (
              <div>
                <div className="tc-account-content-header">
                  <div className="tc-content-header-text">
                    <h2>Địa Chỉ Của Tôi</h2>
                    <p>Địa chỉ giao hàng & xuất hóa đơn bàn giao thiết bị công trình</p>
                  </div>
                  <button type="button" className="tc-btn-add-address" onClick={handleOpenAddAddress}>
                    <PlusOutlined /> Thêm địa chỉ mới
                  </button>
                </div>

                {loadingAddresses ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Đang tải danh sách địa chỉ từ máy chủ...</div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="tc-empty-state">
                    <div className="tc-empty-icon">
                      <EnvironmentOutlined />
                    </div>
                    <div className="tc-empty-title">Bạn chưa có địa chỉ nhận hàng nào</div>
                    <p className="tc-empty-desc">Thêm địa chỉ để quá trình đặt hàng và xuất hóa đơn diễn ra thuận tiện nhất.</p>
                    <button type="button" className="tc-btn-add-address" onClick={handleOpenAddAddress}>
                      <PlusOutlined /> Thêm địa chỉ mới
                    </button>
                  </div>
                ) : (
                  <div className="tc-address-list">
                    {addresses.map((addr) => {
                      const addrId = addr.id || addr.addressId;
                      const isDefaultAddr =
                        addr.isDefault === 1 || addr.isDefault === true || addr.isDefault === "1";
                      const streetText = addr.street || addr.address || "---";
                      const regionText = [
                        addr.ward || addr.wardName,
                        addr.district || addr.districtName,
                        addr.province || addr.provinceName,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <div
                          key={addrId}
                          className={`tc-address-card ${isDefaultAddr ? "is-default" : ""}`}
                        >
                          <div className="tc-address-card-left">
                            <div className="tc-addr-header-row">
                              <span className="tc-addr-name">{addr.fullName}</span>
                              <span className="tc-addr-divider">|</span>
                              <span className="tc-addr-phone">{addr.phone}</span>
                              {isDefaultAddr && (
                                <span className="tc-addr-badge-default">Mặc định</span>
                              )}
                              <span className="tc-addr-badge-type">
                                {addr.type === "office" ? "Văn phòng / Công trình" : "Nhà riêng"}
                              </span>
                            </div>
                            <div className="tc-addr-line-specific">{streetText}</div>
                            <div className="tc-addr-line-region">{regionText || "---"}</div>
                          </div>

                          <div className="tc-address-card-right">
                            <div className="tc-addr-actions">
                              <button
                                type="button"
                                className="tc-addr-action-btn"
                                onClick={() => handleOpenEditAddress(addr)}
                              >
                                Cập nhật
                              </button>
                              {(!isDefaultAddr || addresses.length > 1) && (
                                <button
                                  type="button"
                                  className="tc-addr-action-btn delete"
                                  onClick={() => handleDeleteAddress(addrId)}
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              className="tc-btn-set-default"
                              disabled={isDefaultAddr}
                              onClick={() => handleSetDefaultAddress(addrId)}
                            >
                              {isDefaultAddr ? "Đang là mặc định" : "Thiết lập mặc định"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═════════ TAB 3: ĐƠN MUA ═════════ */}
            {currentTab === "orders" && (
              <div>
                {/* Thanh tab bộ lọc đơn mua (Shopee Style) */}
                <div className="tc-orders-tabs-header">
                  {[
                    { key: "all", label: "Tất cả" },
                    { key: "PENDING", label: "Chờ xác nhận" },
                    { key: "PROCESSING", label: "Đang xử lý" },
                    { key: "SHIPPING", label: "Đang vận chuyển" },
                    { key: "COMPLETED", label: "Hoàn thành" },
                    { key: "CANCELLED", label: "Đã hủy" },
                  ].map((tab) => (
                    <div
                      key={tab.key}
                      className={`tc-order-tab-item ${orderFilter === tab.key ? "active" : ""}`}
                      onClick={() => setOrderFilter(tab.key)}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>

                {/* Thanh tìm kiếm đơn hàng */}
                <div className="tc-orders-search-bar">
                  <SearchOutlined className="tc-orders-search-icon" />
                  <input
                    type="text"
                    className="tc-orders-search-input"
                    placeholder="Tìm kiếm theo Mã đơn hàng, Tên sản phẩm hoặc Người nhận..."
                    value={orderSearchKeyword}
                    onChange={(e) => setOrderSearchKeyword(e.target.value)}
                  />
                </div>

                {/* Danh sách đơn hàng */}
                {filteredOrders.length === 0 ? (
                  <div className="tc-empty-state">
                    <div className="tc-empty-icon">
                      <InboxOutlined />
                    </div>
                    <div className="tc-empty-title">Chưa có đơn hàng nào</div>
                    <p className="tc-empty-desc">
                      {orderFilter === "all"
                        ? "Bạn chưa có đơn đặt hàng nào trong hệ thống."
                        : `Không có đơn hàng nào ở trạng thái "${orderFilter}".`}
                    </p>
                    <Link to="/san-pham" className="tc-empty-btn">
                      Khám phá sản phẩm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="tc-orders-list">
                    {filteredOrders.map((order) => {
                      const totalFormatted = (Number(order.total) || 0).toLocaleString("vi-VN") + "đ";
                      const dateFormatted = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "---";

                      let statusClass = "tc-status-pending";
                      let statusIcon = <ClockCircleOutlined />;
                      if (order.status === "COMPLETED") {
                        statusClass = "tc-status-completed";
                        statusIcon = <CheckCircleOutlined />;
                      } else if (order.status === "SHIPPING") {
                        statusClass = "tc-status-shipping";
                        statusIcon = <CarOutlined />;
                      } else if (order.status === "PROCESSING") {
                        statusClass = "tc-status-processing";
                        statusIcon = <ClockCircleOutlined />;
                      } else if (order.status === "CANCELLED") {
                        statusClass = "tc-status-cancelled";
                        statusIcon = <CloseCircleOutlined />;
                      }

                      return (
                        <div key={order.orderId || order.id} className="tc-order-card">
                          {/* Header đơn */}
                          <div className="tc-order-card-header">
                            <div className="tc-order-header-left">
                              <span className="tc-order-code">#{order.orderId || order.id}</span>
                              <span className="tc-order-date">📅 {dateFormatted}</span>
                            </div>
                            <span className={`tc-order-status-badge ${statusClass}`}>
                              {statusIcon} {order.statusText || order.status}
                            </span>
                          </div>

                          {/* Danh sách mặt hàng */}
                          <div className="tc-order-items">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="tc-order-item-row">
                                <img
                                  src={item.image || PLACEHOLDER_IMAGE}
                                  alt={item.name}
                                  className="tc-order-item-img"
                                  onError={(e) => {
                                    e.target.src = PLACEHOLDER_IMAGE;
                                  }}
                                />
                                <div className="tc-order-item-info">
                                  <div className="tc-order-item-name">{item.name}</div>
                                  {item.specs && (
                                    <div className="tc-order-item-specs">{item.specs}</div>
                                  )}
                                  <div className="tc-order-item-qty">Số lượng: x{item.quantity}</div>
                                </div>
                                <div className="tc-order-item-price">
                                  {(Number(item.price) || 0).toLocaleString("vi-VN")}đ
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer đơn */}
                          <div className="tc-order-card-footer">
                            <div className="tc-order-footer-total">
                              Thành tiền:
                              <span className="tc-order-total-highlight">{totalFormatted}</span>
                            </div>
                            <div className="tc-order-footer-actions">
                              <button
                                type="button"
                                className="tc-btn-order-action secondary"
                                onClick={() => setDetailOrderModal(order)}
                              >
                                Xem chi tiết
                              </button>
                              <button
                                type="button"
                                className="tc-btn-order-action primary"
                                onClick={() => handleReorder(order)}
                              >
                                Mua lại
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═════════ TAB 4: ĐỔI MẬT KHẨU ═════════ */}
            {currentTab === "password" && (
              <div>
                <div className="tc-account-content-header">
                  <div className="tc-content-header-text">
                    <h2>Đổi Mật Khẩu</h2>
                    <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="tc-password-form">
                  <div className="tc-password-row">
                    <label>Mật khẩu hiện tại *</label>
                    <div className="tc-pwd-input-wrap">
                      <input
                        type={showPwd.current ? "text" : "password"}
                        className={pwdErrors.currentPassword ? "input-error" : ""}
                        placeholder="Nhập mật khẩu hiện tại"
                        value={pwdForm.currentPassword}
                        onChange={(e) => {
                          setPwdForm({ ...pwdForm, currentPassword: e.target.value });
                          if (pwdErrors.currentPassword) setPwdErrors((prev) => ({ ...prev, currentPassword: "" }));
                        }}
                      />
                      <button
                        type="button"
                        className="tc-pwd-toggle-btn"
                        onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })}
                      >
                        {showPwd.current ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                    {pwdErrors.currentPassword && <span className="tc-field-error">{pwdErrors.currentPassword}</span>}
                  </div>

                  <div className="tc-password-row">
                    <label>Mật khẩu mới *</label>
                    <div className="tc-pwd-input-wrap">
                      <input
                        type={showPwd.new ? "text" : "password"}
                        className={pwdErrors.newPassword ? "input-error" : ""}
                        placeholder="Tối thiểu 6 ký tự"
                        value={pwdForm.newPassword}
                        onChange={(e) => {
                          setPwdForm({ ...pwdForm, newPassword: e.target.value });
                          if (pwdErrors.newPassword) setPwdErrors((prev) => ({ ...prev, newPassword: "" }));
                        }}
                      />
                      <button
                        type="button"
                        className="tc-pwd-toggle-btn"
                        onClick={() => setShowPwd({ ...showPwd, new: !showPwd.new })}
                      >
                        {showPwd.new ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                    {pwdErrors.newPassword ? (
                      <span className="tc-field-error">{pwdErrors.newPassword}</span>
                    ) : (
                      <span className="tc-pwd-note">Mật khẩu cần tối thiểu 6 ký tự.</span>
                    )}
                  </div>

                  <div className="tc-password-row">
                    <label>Xác nhận mật khẩu mới *</label>
                    <div className="tc-pwd-input-wrap">
                      <input
                        type={showPwd.confirm ? "text" : "password"}
                        className={pwdErrors.confirmPassword ? "input-error" : ""}
                        placeholder="Nhập lại mật khẩu mới"
                        value={pwdForm.confirmPassword}
                        onChange={(e) => {
                          setPwdForm({ ...pwdForm, confirmPassword: e.target.value });
                          if (pwdErrors.confirmPassword) setPwdErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                      />
                      <button
                        type="button"
                        className="tc-pwd-toggle-btn"
                        onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}
                      >
                        {showPwd.confirm ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                    {pwdErrors.confirmPassword && <span className="tc-field-error">{pwdErrors.confirmPassword}</span>}
                  </div>

                  <button type="submit" className="tc-btn-submit-pwd" disabled={isSavingPwd}>
                    {isSavingPwd ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                  </button>

                  <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#64748b" }}>
                    💡 Quý khách quên mật khẩu hiện tại? Vui lòng liên hệ Hotline Kỹ thuật{" "}
                    <a href="tel:0904537559" style={{ color: "#c8102e", fontWeight: 700 }}>
                      0865 130 088
                    </a>{" "}
                    để được cấp lại mã bảo mật.
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ─── MODAL THÊM / SỬA ĐỊA CHỈ (GHN & BACKEND) ─── */}
      <Modal
        title={editingAddress ? "Cập nhật địa chỉ nhận hàng" : "Thêm địa chỉ mới"}
        open={addressModalOpen}
        onCancel={() => setAddressModalOpen(false)}
        onOk={handleSaveAddress}
        confirmLoading={isSavingAddress}
        okText={editingAddress ? "Lưu thay đổi" : "Hoàn thành"}
        cancelText="Trở lại"
        okButtonProps={{ style: { background: "#c8102e", borderColor: "#c8102e" } }}
        centered
        width={580}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {/* Họ tên & SĐT */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="tc-addr-field-group">
              <label className="tc-addr-label">Họ và tên người nhận *</label>
              <input
                type="text"
                className={`tc-addr-input ${addressErrors.fullName ? "input-error" : ""}`}
                placeholder="Họ và tên người nhận"
                value={addressFormData.fullName}
                onChange={(e) => {
                  setAddressFormData({ ...addressFormData, fullName: e.target.value });
                  if (addressErrors.fullName) setAddressErrors((prev) => ({ ...prev, fullName: "" }));
                }}
              />
              {addressErrors.fullName && <span className="tc-field-error">{addressErrors.fullName}</span>}
            </div>

            <div className="tc-addr-field-group">
              <label className="tc-addr-label">Số điện thoại *</label>
              <input
                type="tel"
                className={`tc-addr-input ${addressErrors.phone ? "input-error" : ""}`}
                placeholder="VD: 0912345678"
                value={addressFormData.phone}
                onChange={(e) => {
                  setAddressFormData({ ...addressFormData, phone: e.target.value });
                  if (addressErrors.phone) setAddressErrors((prev) => ({ ...prev, phone: "" }));
                }}
              />
              {addressErrors.phone && <span className="tc-field-error">{addressErrors.phone}</span>}
            </div>
          </div>

          {/* Tỉnh / Thành phố */}
          <div className="tc-addr-field-group">
            <label className="tc-addr-label">
              Tỉnh / Thành phố *{" "}
              {loadingProvinces && (
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>(Đang tải...)</span>
              )}
            </label>
            <select
              className={`tc-addr-select ${addressErrors.provinceId ? "input-error" : ""}`}
              value={addressFormData.provinceId}
              onChange={handleProvinceChange}
              disabled={loadingProvinces}
            >
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              {provinces.map((prov) => (
                <option key={prov.ProvinceID} value={prov.ProvinceID}>
                  {prov.ProvinceName}
                </option>
              ))}
            </select>
            {addressErrors.provinceId && <span className="tc-field-error">{addressErrors.provinceId}</span>}
          </div>

          {/* Quận / Huyện & Phường / Xã */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="tc-addr-field-group">
              <label className="tc-addr-label">
                Quận / Huyện *{" "}
                {loadingDistricts && (
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>(Đang tải...)</span>
                )}
              </label>
              <select
                className={`tc-addr-select ${addressErrors.toDistrictId ? "input-error" : ""}`}
                value={addressFormData.toDistrictId}
                onChange={handleDistrictChange}
                disabled={!addressFormData.provinceId || loadingDistricts}
              >
                <option value="">
                  {!addressFormData.provinceId ? "-- Chọn Tỉnh/Thành trước --" : "-- Chọn Quận / Huyện --"}
                </option>
                {districts.map((dist) => (
                  <option key={dist.DistrictID} value={dist.DistrictID}>
                    {dist.DistrictName}
                  </option>
                ))}
              </select>
              {addressErrors.toDistrictId && <span className="tc-field-error">{addressErrors.toDistrictId}</span>}
            </div>

            <div className="tc-addr-field-group">
              <label className="tc-addr-label">
                Phường / Xã *{" "}
                {loadingWards && (
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>(Đang tải...)</span>
                )}
              </label>
              <select
                className={`tc-addr-select ${addressErrors.wardId ? "input-error" : ""}`}
                value={addressFormData.wardId}
                onChange={handleWardChange}
                disabled={!addressFormData.toDistrictId || loadingWards}
              >
                <option value="">
                  {!addressFormData.toDistrictId ? "-- Chọn Quận/Huyện trước --" : "-- Chọn Phường / Xã --"}
                </option>
                {wards.map((w) => (
                  <option key={w.WardCode} value={w.WardCode}>
                    {w.WardName}
                  </option>
                ))}
              </select>
              {addressErrors.wardId && <span className="tc-field-error">{addressErrors.wardId}</span>}
            </div>
          </div>

          {/* Địa chỉ cụ thể */}
          <div className="tc-addr-field-group">
            <label className="tc-addr-label">Địa chỉ cụ thể (Số nhà, tên đường, tên công trình...) *</label>
            <textarea
              rows={2}
              className={`tc-addr-input ${addressErrors.street ? "input-error" : ""}`}
              placeholder="VD: 123 Nguyễn Trãi, Tòa nhà Licogi 13..."
              value={addressFormData.street}
              onChange={(e) => {
                setAddressFormData({ ...addressFormData, street: e.target.value });
                if (addressErrors.street) setAddressErrors((prev) => ({ ...prev, street: "" }));
              }}
            />
            {addressErrors.street && <span className="tc-field-error">{addressErrors.street}</span>}
          </div>

          {/* Loại địa chỉ */}
          <div>
            <label className="tc-addr-label" style={{ marginBottom: 6 }}>
              Loại địa chỉ
            </label>
            <div style={{ display: "flex", gap: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="addrType"
                  value="office"
                  checked={addressFormData.type === "office"}
                  onChange={() => setAddressFormData({ ...addressFormData, type: "office" })}
                />
                Văn phòng / Công trình
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="addrType"
                  value="home"
                  checked={addressFormData.type === "home"}
                  onChange={() => setAddressFormData({ ...addressFormData, type: "home" })}
                />
                Nhà riêng
              </label>
            </div>
          </div>

          {/* Checkbox Đặt làm mặc định */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginTop: 4 }}>
            <input
              type="checkbox"
              checked={addressFormData.isDefault}
              onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
            />
            <span style={{ fontWeight: 600, color: "#334155" }}>Đặt làm địa chỉ nhận hàng mặc định</span>
          </label>
        </div>
      </Modal>

      {/* ─── MODAL CHI TIẾT ĐƠN HÀNG ─── */}
      <Modal
        title={`Chi tiết đơn hàng #${detailOrderModal?.orderId || detailOrderModal?.id || ""}`}
        open={Boolean(detailOrderModal)}
        onCancel={() => setDetailOrderModal(null)}
        footer={null}
        centered
        width={680}
      >
        {detailOrderModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, lineHeight: 1.8 }}>
              <div><strong>Trạng thái:</strong> <span style={{ color: "#c8102e", fontWeight: 700 }}>{detailOrderModal.statusText || detailOrderModal.status}</span></div>
              <div><strong>Người nhận:</strong> {detailOrderModal.customerName} - {detailOrderModal.phone}</div>
              <div><strong>Địa chỉ giao hàng:</strong> {detailOrderModal.shippingAddress}</div>
              <div><strong>Phương thức thanh toán:</strong> {detailOrderModal.paymentMethodText || detailOrderModal.paymentMethod}</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Danh sách sản phẩm:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {detailOrderModal.items?.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <img src={it.image || PLACEHOLDER_IMAGE} alt={it.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Số lượng: x{it.quantity}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c8102e" }}>
                      {(Number(it.price) || 0).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "2px solid #fee2e2", fontSize: 15 }}>
              <strong>Tổng thanh toán:</strong>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#c8102e" }}>
                {(Number(detailOrderModal.total) || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AccountPage;
