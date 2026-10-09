import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Modal, message, Spin } from "antd";
import {
  ExclamationCircleOutlined,
  LoadingOutlined,
  EnvironmentOutlined,
  EditOutlined,
} from "@ant-design/icons";
import CartItem from "../../components/common/customer/cart/CartItem";
import defaultCartImg from "../../assets/images/projects/sapa-thuy-dien-360.webp";
import {
  getCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
} from "../../utils/cartUtils";
import { isCustomerAuthenticated, getCustomerUser } from "../../utils/auth";
import {
  getCartItems,
  updateCartItem,
  deleteCartItem,
} from "../../services/customer/CustomerCartService";
import { getListAddress } from "../../services/customer/CustomerAddressService";
import { getProfile } from "../../services/customer/CustomerProfileService";
import {
  getProvinces,
  getDistricts,
  getWards,
} from "../../services/customer/CustomerGhnService";
import { createBill } from "../../services/customer/CustomerBillService";
import { saveLocalCustomerOrder } from "../../services/customer/CustomerUserService";
import "./CartPage.css";
import { PLACEHOLDER_IMAGE } from '../../utils/placeholder';

export default function CartPage() {
  const isAuthenticated = isCustomerAuthenticated();
  const [cartItems, setCartItems] = useState(() => getCart());
  const [loadingCart, setLoadingCart] = useState(() => isCustomerAuthenticated());
  const [backendCartInfo, setBackendCartInfo] = useState(null);
  const updateDebounceTimers = useRef({});
  const [gender, setGender] = useState("anh");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    provinceId: "",
    provinceName: "",
    districtId: "",
    districtName: "",
    wardCode: "",
    wardName: "",
    address: "",
    note: "",
    needVat: false,
    companyName: "",
    taxCode: "",
    companyAddress: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState("delivery"); // 'delivery' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' | 'banking' | 'contract'
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);

  // GHN Address States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Saved Customer Addresses
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [loadingCustomerAddresses, setLoadingCustomerAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Helper chuyển đổi item từ Backend sang định dạng giao diện CartItem
  const mapBackendCartItem = (beItem) => ({
    id: beItem.id, // Cart Item ID (dùng cho update/delete)
    productId: beItem.productId, // Product ID (dùng cho link/tạo đơn)
    name: beItem.productName || "Sản phẩm",
    image: beItem.productImage || defaultCartImg,
    price: Number(beItem.unitPrice) || 0,
    quantity: Number(beItem.quantity) || 1,
    stockQuantity: Number(beItem.stockQuantity) || 0,
    subtotal:
      Number(beItem.subtotal) ||
      (Number(beItem.unitPrice) || 0) * (Number(beItem.quantity) || 1),
    sku: beItem.sku || beItem.productId,
    brand: beItem.brand || "Lion King",
    warranty: beItem.warranty || "24 tháng",
  });

  const fetchBackendCart = async () => {
    try {
      setLoadingCart(true);
      const res = await getCartItems();
      const cartData = res?.data || res;
      if (cartData && Array.isArray(cartData.items)) {
        const mapped = cartData.items.map(mapBackendCartItem);
        setCartItems(mapped);
        setBackendCartInfo({
          id: cartData.id,
          totalAmount: cartData.totalAmount,
          totalQuantity: cartData.totalQuantity,
        });
        try {
          localStorage.setItem("tc_cart", JSON.stringify(mapped));
        } catch (e) {}
      } else {
        setCartItems([]);
        try {
          localStorage.setItem("tc_cart", JSON.stringify([]));
        } catch (e) {}
      }
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng từ máy chủ:", err);
      setCartItems(getCart());
    } finally {
      setLoadingCart(false);
    }
  };

  // Tải giỏ hàng khi mount hoặc khi trạng thái đăng nhập thay đổi (không lắng nghe sự kiện vòng lặp)
  useEffect(() => {
    if (isAuthenticated) {
      fetchBackendCart();
    } else {
      setCartItems(getCart());
      setLoadingCart(false);
    }

    return () => {
      // Dọn dẹp tất cả bộ hẹn giờ debounce khi component unmount
      if (updateDebounceTimers.current) {
        Object.values(updateDebounceTimers.current).forEach(clearTimeout);
      }
    };
  }, [isAuthenticated]);

  // Tải thông tin người nhận và danh sách địa chỉ khi đã đăng nhập
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    // Lấy thông tin user từ localStorage
    const cachedUser = getCustomerUser();
    if (cachedUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || cachedUser.fullName || "",
        phone: prev.phone || cachedUser.phone || "",
        email: prev.email || cachedUser.email || "",
      }));
    }

    // Tải thông tin hồ sơ mới nhất từ API Profile
    getProfile()
      .then((res) => {
        const p = res?.data || res;
        if (isMounted && p && typeof p === "object") {
          setFormData((prev) => ({
            ...prev,
            fullName: p.fullName || p.fullNam || prev.fullName,
            phone: p.phone || p.numberPhone || prev.phone,
            email: p.email || prev.email,
          }));
        }
      })
      .catch((err) => {
        console.info("Lỗi lấy thông tin profile:", err);
      });

    // Tải danh sách địa chỉ từ CustomerAddressService
    setLoadingCustomerAddresses(true);
    getListAddress()
      .then((res) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && Array.isArray(list)) {
          setCustomerAddresses(list);
          if (list.length > 0) {
            // Chọn địa chỉ mặc định hoặc địa chỉ đầu tiên
            const defaultAddr = list.find(
              (a) => a.isDefault === 1 || a.isDefault === true || a.isDefault === "1"
            );
            const chosen = defaultAddr || list[0];
            setSelectedAddressId(chosen.id || chosen.addressId);
            if (chosen.fullName || chosen.phone) {
              setFormData((prev) => ({
                ...prev,
                fullName: chosen.fullName || prev.fullName,
                phone: chosen.phone || prev.phone,
              }));
            }
          }
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách địa chỉ của khách hàng:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingCustomerAddresses(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Fetch provinces from GHN API on mount
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

  // Handle Province change
  const handleProvinceChange = async (e) => {
    const pId = e.target.value;
    const selectedProv = provinces.find((p) => String(p.ProvinceID) === String(pId));

    setFormData((prev) => ({
      ...prev,
      provinceId: pId,
      provinceName: selectedProv ? selectedProv.ProvinceName : "",
      districtId: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
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
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Handle District change
  const handleDistrictChange = async (e) => {
    const dId = e.target.value;
    const selectedDist = districts.find((d) => String(d.DistrictID) === String(dId));

    setFormData((prev) => ({
      ...prev,
      districtId: dId,
      districtName: selectedDist ? selectedDist.DistrictName : "",
      wardCode: "",
      wardName: "",
    }));
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
    } finally {
      setLoadingWards(false);
    }
  };

  // Handle Ward change
  const handleWardChange = (e) => {
    const wCode = e.target.value;
    const selectedWard = wards.find((w) => String(w.WardCode) === String(wCode));
    setFormData((prev) => ({
      ...prev,
      wardCode: wCode,
      wardName: selectedWard ? selectedWard.WardName : "",
    }));
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Cart operations
  const handleUpdateQty = (id, newQty) => {
    if (newQty < 1) return;
    const targetItem = cartItems.find((item) => item.id === id);
    if (!targetItem) return;
    if (targetItem.quantity === newQty) return;

    // 1. Cập nhật giao diện tức thì (Optimistic UI) cho trải nghiệm mượt mà
    setCartItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              quantity: newQty,
              subtotal: (Number(it.price) || 0) * newQty,
            }
          : it
      )
    );

    // 2. Debounce delay (400ms) để gom các lần bấm liên tục, tránh spam API lên Backend
    if (updateDebounceTimers.current[id]) {
      clearTimeout(updateDebounceTimers.current[id]);
    }

    updateDebounceTimers.current[id] = setTimeout(async () => {
      if (isAuthenticated) {
        try {
          // Gọi updateCartItem với id của cart detail và quantity mới
          await updateCartItem(id, { quantity: String(newQty) });

          // Cập nhật bộ nhớ đệm LocalStorage
          const currentList = getCart();
          const nextList = currentList.map((it) =>
            it.id === id ? { ...it, quantity: newQty } : it
          );
          localStorage.setItem("tc_cart", JSON.stringify(nextList));

          // Tính tổng số lượng để cập nhật Header badge mà không cần gọi lại BE
          const totalQty = nextList.reduce(
            (sum, it) => sum + (parseInt(it.quantity, 10) || 1),
            0
          );
          window.dispatchEvent(
            new CustomEvent("tc_cart_updated", {
              detail: { count: totalQty, source: "cart_page" },
            })
          );
        } catch (err) {
          console.error("Lỗi cập nhật số lượng giỏ hàng:", err);
          message.error(
            err?.response?.data?.message ||
              err?.message ||
              "Cập nhật số lượng sản phẩm thất bại!"
          );
          // Hoàn nguyên lại dữ liệu từ BE nếu có lỗi
          fetchBackendCart();
        }
      } else {
        const updated = updateCartItemQty(id, newQty);
        const totalQty = updated.reduce(
          (sum, it) => sum + (parseInt(it.quantity, 10) || 1),
          0
        );
        window.dispatchEvent(
          new CustomEvent("tc_cart_updated", {
            detail: { count: totalQty, source: "cart_page" },
          })
        );
      }
    }, 400);
  };

  const handleRemoveItem = (id) => {
    const targetItem = cartItems.find((item) => item.id === id);
    if (!targetItem) return;

    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${targetItem.name}" khỏi giỏ hàng không?`,
      okText: "Xóa sản phẩm",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          // Xóa debounce timer nếu đang chờ
          if (updateDebounceTimers.current[id]) {
            clearTimeout(updateDebounceTimers.current[id]);
            delete updateDebounceTimers.current[id];
          }

          if (isAuthenticated) {
            // Truyền vào id của cart detail để xóa
            await deleteCartItem(targetItem.id);
            message.success(`Đã xóa "${targetItem.name}" khỏi giỏ hàng!`);
          } else {
            removeCartItem(id);
            message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
          }

          // Cập nhật lại state danh sách ngay lập tức
          setCartItems((prev) => {
            const next = prev.filter((it) => it.id !== id);
            localStorage.setItem("tc_cart", JSON.stringify(next));
            const totalQty = next.reduce(
              (sum, it) => sum + (parseInt(it.quantity, 10) || 1),
              0
            );
            window.dispatchEvent(
              new CustomEvent("tc_cart_updated", {
                detail: { count: totalQty, source: "cart_page" },
              })
            );
            return next;
          });
        } catch (err) {
          console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", err);
          message.error(
            err?.response?.data?.message ||
              err?.message ||
              "Xóa sản phẩm khỏi giỏ hàng thất bại!"
          );
        }
      },
    });
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;

    Modal.confirm({
      title: "Xóa toàn bộ giỏ hàng",
      icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
      content: "Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng không?",
      okText: "Xóa tất cả",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          if (isAuthenticated) {
            for (const item of cartItems) {
              if (updateDebounceTimers.current[item.id]) {
                clearTimeout(updateDebounceTimers.current[item.id]);
              }
              await deleteCartItem(item.id);
            }
            updateDebounceTimers.current = {};
          } else {
            clearCart();
          }
          setCartItems([]);
          localStorage.setItem("tc_cart", JSON.stringify([]));
          window.dispatchEvent(
            new CustomEvent("tc_cart_updated", {
              detail: { count: 0, source: "cart_page" },
            })
          );
          message.success("Đã xóa toàn bộ sản phẩm khỏi giỏ hàng!");
        } catch (err) {
          console.error("Lỗi xóa toàn bộ giỏ hàng:", err);
          message.error("Có lỗi xảy ra khi xóa giỏ hàng!");
        }
      },
    });
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );
  const totalQuantity = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 1), 0);
  const shippingFee = 0; // Mặc định 0đ theo yêu cầu
  const finalTotal = subtotal + shippingFee;

  const formatPrice = (price) =>
    price.toLocaleString("vi-VN") + "đ";

  const mapPaymentMethod = (method) => {
    if (method === "banking") return "BANK_TRANSFER";
    if (method === "contract") return "CONTRACT";
    return "COD";
  };

  // 1. Kiểm tra thông tin và mở popup xác nhận
  const handleInitiateOrder = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert("Vui lòng điền họ tên và số điện thoại nhận hàng!");
      return;
    }

    const hasSavedAddress =
      isAuthenticated && !useCustomAddress && customerAddresses.length > 0;

    if (deliveryMethod === "delivery") {
      if (hasSavedAddress) {
        if (!selectedAddressId && customerAddresses.length > 0) {
          alert("Vui lòng chọn một địa chỉ nhận hàng!");
          return;
        }
      } else {
        if (!formData.provinceId) {
          alert("Vui lòng chọn Tỉnh / Thành phố nhận hàng!");
          return;
        }
        if (!formData.districtId) {
          alert("Vui lòng chọn Quận / Huyện nhận hàng!");
          return;
        }
        if (!formData.address.trim()) {
          alert("Vui lòng điền địa chỉ công trình / số nhà cụ thể!");
          return;
        }
      }
    }

    if (!agreeTerms) {
      alert("Vui lòng đồng ý với điều khoản dịch vụ để tiếp tục!");
      return;
    }

    // Xác định địa chỉ giao hàng và thông tin người nhận
    let fullShippingAddress = "";
    let recipientName = ((gender === "anh" ? "Anh " : "Chị ") + formData.fullName).trim();
    let recipientPhone = formData.phone.trim();

    if (deliveryMethod === "delivery") {
      const selectedSavedAddr = hasSavedAddress
        ? customerAddresses.find((a) => (a.id || a.addressId) === selectedAddressId) || customerAddresses[0]
        : null;

      if (selectedSavedAddr) {
        const streetPart = selectedSavedAddr.street || selectedSavedAddr.address;
        const wardPart = selectedSavedAddr.ward || selectedSavedAddr.wardName;
        const distPart = selectedSavedAddr.district || selectedSavedAddr.districtName;
        const provPart = selectedSavedAddr.province || selectedSavedAddr.provinceName;
        fullShippingAddress = [streetPart, wardPart, distPart, provPart]
          .filter(Boolean)
          .join(", ");

        if (selectedSavedAddr.fullName) {
          recipientName = ((gender === "anh" ? "Anh " : "Chị ") + selectedSavedAddr.fullName).trim();
        }
        if (selectedSavedAddr.phone) {
          recipientPhone = selectedSavedAddr.phone.trim();
        }
      } else {
        fullShippingAddress = [
          formData.address.trim(),
          formData.wardName,
          formData.districtName,
          formData.provinceName,
        ]
          .filter(Boolean)
          .join(", ");
      }
    } else {
      fullShippingAddress =
        "Nhận tại Văn phòng Hà Nội, Số 9, Ngõ 68, Phường Phú Diễn, Quận Bắc Từ Liêm, TP. Hà Nội";
    }

    // Note: nếu người dùng tích yêu cầu xuất hóa đơn thì note = yêu cầu xuất hóa đơn VAT + note
    let finalNote = formData.note ? formData.note.trim() : "";
    if (formData.needVat) {
      const vatInfo = [
        formData.companyName ? `Công ty: ${formData.companyName}` : "",
        formData.taxCode ? `MST: ${formData.taxCode}` : "",
        formData.companyAddress ? `Địa chỉ Cty: ${formData.companyAddress}` : "",
      ]
        .filter(Boolean)
        .join(" - ");

      const vatPrefix = vatInfo
        ? `yêu cầu xuất hóa đơn VAT (${vatInfo})`
        : "yêu cầu xuất hóa đơn VAT";

      finalNote = finalNote ? `${vatPrefix} + ${finalNote}` : vatPrefix;
    }

    const billPayload = {
      shippingName: recipientName,
      shippingPhone: recipientPhone,
      email: formData.email ? formData.email.trim() : "",
      shippingAddress: fullShippingAddress,
      paymentMethod: mapPaymentMethod(paymentMethod),
      requestInvoice: Boolean(formData.needVat),
      note: finalNote,
      items: cartItems.map((item) => ({
        productId: item.productId || item.id,
        quantity: Number(item.quantity) || 1,
      })),
      shippingFee: 0,
      discountAmount: 0,
    };

    setPendingOrder({
      payload: billPayload,
      customerName: recipientName,
      phone: recipientPhone,
      email: formData.email ? formData.email.trim() : "",
      shippingAddress: fullShippingAddress,
      deliveryMethodText:
        deliveryMethod === "delivery"
          ? "Giao hàng tận nơi toàn quốc (Viettel Post)"
          : "Nhận tại Văn phòng Hà Nội (Phú Diễn)",
      paymentMethodText:
        paymentMethod === "banking"
          ? "Chuyển khoản Ngân hàng (MBBank)"
          : paymentMethod === "contract"
          ? "Hợp đồng dự án / Tiến độ"
          : "Thanh toán khi nhận hàng (COD)",
      needVat: formData.needVat,
      vatInfo: formData.needVat
        ? `${formData.companyName || "Chưa có tên cty"} (MST: ${formData.taxCode || "---"})`
        : "Không",
      note: formData.note ? formData.note.trim() : "",
      total: finalTotal,
      itemCount: totalQuantity,
    });

    setShowConfirmModal(true);
  };

  // 2. Người dùng bấm xác nhận -> Chạy hiệu ứng loading vài giây -> Thông báo thành công
  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      // Đảm bảo hiệu ứng loading chạy mượt mà khoảng 2 giây
      const [res] = await Promise.all([
        createBill(pendingOrder.payload),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      const orderId =
        res?.data?.code ||
        res?.data?.orderCode ||
        res?.data?.id ||
        res?.code ||
        ("TC-" + Math.floor(100000 + Math.random() * 900000));

      setOrderSuccess({
        orderId,
        customerName: pendingOrder.customerName,
        phone: pendingOrder.phone,
        address: pendingOrder.shippingAddress,
        total: pendingOrder.total,
        paymentMethod: pendingOrder.payload.paymentMethod,
      });

      // Save to customer order history
      saveLocalCustomerOrder({
        orderId,
        createdAt: new Date().toISOString(),
        status: "PENDING",
        statusText: "Chờ xác nhận",
        customerName: pendingOrder.customerName,
        phone: pendingOrder.phone,
        shippingAddress: pendingOrder.shippingAddress,
        paymentMethod: pendingOrder.payload.paymentMethod,
        paymentMethodText:
          pendingOrder.payload.paymentMethod === "BANK_TRANSFER"
            ? "Chuyển khoản ngân hàng"
            : pendingOrder.payload.paymentMethod === "CONTRACT"
            ? "Hợp đồng dự án / Công nợ"
            : "Thanh toán khi nhận hàng (COD)",
        total: pendingOrder.total,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code || "TC-SP",
          image: item.image || item.imageUrl || PLACEHOLDER_IMAGE,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          specs: item.specs || "",
        })),
      });

      // Clear cart in backend & local storage after successful checkout
      if (isAuthenticated) {
        try {
          for (const item of cartItems) {
            await deleteCartItem(item.id);
          }
        } catch (e) {
          console.info("Lỗi dọn giỏ hàng sau khi đặt:", e);
        }
      }
      clearCart();
      setCartItems([]);
      window.dispatchEvent(new Event("tc_cart_updated"));
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng kiểm tra lại thông tin!";
      alert(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page-wrapper">
      {/* 1. Breadcrumb */}
      <nav className="cart-breadcrumb" aria-label="breadcrumb">
        <div className="cart-container">
          <div className="cart-breadcrumb-inner">
            <Link to="/">Trang chủ</Link>
            <span className="cart-breadcrumb-sep">/</span>
            <span className="cart-breadcrumb-curr">Giỏ hàng & Thanh toán</span>
          </div>
        </div>
      </nav>

      <div className="cart-container cart-main-content">
        {/* Page Top Header */}
        <div className="cart-page-header">
          <div className="cart-title-wrap">
            <h1>Giỏ Hàng Của Bạn</h1>
            <span className="cart-count-badge">{totalQuantity} sản phẩm</span>
          </div>
          <Link to="/san-pham" className="cart-back-shop-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Tiếp tục mua hàng
          </Link>
        </div>

        {/* Kiểm tra nếu giỏ hàng đang tải hoặc trống */}
        {loadingCart ? (
          <div
            className="cart-empty-state"
            style={{
              minHeight: "320px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "48px 24px",
            }}
          >
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 40, color: "#d90429" }}
                  spin
                />
              }
            />
            <h3
              style={{
                marginTop: 20,
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              Đang tải thông tin giỏ hàng...
            </h3>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Vui lòng đợi trong giây lát
            </p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>
              Chưa có sản phẩm nào được chọn. Hãy khám phá các thiết bị còi hú báo
              động công suất lớn và thiết bị PCCC chính hãng Lion King của chúng tôi.
            </p>
            <Link to="/san-pham" className="cart-btn-primary">
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* ═════════════════════════════════════════════
                CỘT TRÁI (65%): Danh sách SP + Form thông tin
               ═════════════════════════════════════════════ */}
            <div className="cart-left-col">
              {/* KHỐI 1: Danh sách sản phẩm */}
              <div className="cart-panel">
                <div className="cart-panel-header">
                  <div className="cart-panel-title">
                    <span className="cart-step-num">1</span>
                    <h3>Sản phẩm trong giỏ ({totalQuantity})</h3>
                  </div>
                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={handleClearCart}
                  >
                    Xóa tất cả
                  </button>
                </div>

                {/* Table Header cho Desktop */}
                <div className="cart-table-head">
                  <span className="cart-th-prod">Sản phẩm</span>
                  <span className="cart-th-price">Đơn giá</span>
                  <span className="cart-th-qty">Số lượng</span>
                  <span className="cart-th-total">Thành tiền</span>
                  <span className="cart-th-del">Xóa</span>
                </div>

                {/* List Items */}
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQty={handleUpdateQty}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>

                <div className="cart-panel-footer">
                  <div className="cart-guarantee-note">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span>100% Hàng mới chính hãng Lion King kèm chứng từ CO/CQ</span>
                  </div>
                  <div className="cart-subtotal-text">
                    Tạm tính ({totalQuantity} SP):{" "}
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                </div>
              </div>

              {/* KHỐI 2: Thông tin người nhận hàng */}
              <div className="cart-panel">
                <div className="cart-panel-header">
                  <div className="cart-panel-title">
                    <span className="cart-step-num">2</span>
                    <h3>Thông tin người nhận & Địa chỉ giao hàng</h3>
                  </div>
                </div>

                <div className="cart-panel-body">
                  {/* Chọn giới tính xưng hô */}
                  <div className="cart-gender-pills">
                    <label
                      className={`cart-gender-pill ${
                        gender === "anh" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="anh"
                        checked={gender === "anh"}
                        onChange={() => setGender("anh")}
                      />
                      <span>Anh</span>
                    </label>
                    <label
                      className={`cart-gender-pill ${
                        gender === "chi" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="chi"
                        checked={gender === "chi"}
                        onChange={() => setGender("chi")}
                      />
                      <span>Chị</span>
                    </label>
                  </div>

                  {/* Họ tên và số điện thoại */}
                  <div className="cart-form-row">
                    <div className="cart-form-group">
                      <label>Họ và tên *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        required
                      />
                    </div>
                    <div className="cart-form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: 0904 537 559"
                        required
                      />
                    </div>
                  </div>

                  {/* Email nhận báo giá / hóa đơn */}
                  <div className="cart-form-group">
                    <label>Địa chỉ Email (Nhận báo giá / hóa đơn điện tử)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@congty.com"
                    />
                  </div>

                  {/* Chọn hình thức nhận hàng */}
                  <div className="cart-delivery-cards">
                    <label
                      className={`cart-method-card ${
                        deliveryMethod === "delivery" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="delivery"
                        checked={deliveryMethod === "delivery"}
                        onChange={() => setDeliveryMethod("delivery")}
                      />
                      <div className="cart-method-content">
                        <div className="cart-method-top">
                          <span className="cart-method-title">
                            Giao hàng tận nơi toàn quốc
                          </span>
                          <span className="cart-method-badge">
                            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                          </span>
                        </div>
                        <p className="cart-method-desc">
                          Vận chuyển qua Viettel Post hoặc xe chuyên dụng công trình
                          nhà máy.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`cart-method-card ${
                        deliveryMethod === "pickup" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="pickup"
                        checked={deliveryMethod === "pickup"}
                        onChange={() => setDeliveryMethod("pickup")}
                      />
                      <div className="cart-method-content">
                        <div className="cart-method-top">
                          <span className="cart-method-title">
                            Nhận tại Văn phòng Hà Nội
                          </span>
                          <span className="cart-method-badge free">Miễn phí</span>
                        </div>
                        <p className="cart-method-desc">
                          Số 9, Ngõ 68, P. Phú Diễn, Q. Bắc Từ Liêm, TP. Hà Nội
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Địa chỉ giao hàng cụ thể (nếu chọn giao tận nơi) */}
                  {deliveryMethod === "delivery" && (
                    <div className="cart-saved-addresses-box">
                      {isAuthenticated && customerAddresses.length > 0 && !useCustomAddress ? (
                        <div className="cart-saved-addr-container">
                          <div className="cart-saved-addr-header">
                            <div className="cart-saved-addr-title">
                              <EnvironmentOutlined style={{ color: "#d90429", fontSize: 18 }} />
                              <span>Địa chỉ nhận hàng của bạn ({customerAddresses.length})</span>
                            </div>
                            <Link
                              to="/tai-khoan?tab=address"
                              className="cart-btn-manage-addr"
                              title="Thêm hoặc sửa địa chỉ trong tài khoản"
                            >
                              <EditOutlined /> Quản lý địa chỉ
                            </Link>
                          </div>

                          <div className="cart-saved-addr-list">
                            {customerAddresses.map((addr) => {
                              const addrId = addr.id || addr.addressId;
                              const isSelected = selectedAddressId === addrId;
                              const isDefault =
                                addr.isDefault === 1 || addr.isDefault === true || addr.isDefault === "1";
                              const fullAddressText = [
                                addr.street || addr.address,
                                addr.ward || addr.wardName,
                                addr.district || addr.districtName,
                                addr.province || addr.provinceName,
                              ]
                                .filter(Boolean)
                                .join(", ");

                              return (
                                <div
                                  key={addrId}
                                  className={`cart-saved-addr-card ${isSelected ? "selected" : ""}`}
                                  onClick={() => {
                                    setSelectedAddressId(addrId);
                                    if (addr.fullName || addr.phone) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        fullName: addr.fullName || prev.fullName,
                                        phone: addr.phone || prev.phone,
                                      }));
                                    }
                                  }}
                                >
                                  <div className="cart-saved-addr-radio">
                                    <input
                                      type="radio"
                                      name="selectedAddress"
                                      checked={isSelected}
                                      onChange={() => {}}
                                    />
                                  </div>
                                  <div className="cart-saved-addr-body">
                                    <div className="cart-saved-addr-top">
                                      <span className="cart-saved-addr-name">
                                        {addr.fullName || formData.fullName}
                                      </span>
                                      <span className="cart-saved-addr-divider">|</span>
                                      <span className="cart-saved-addr-phone">
                                        {addr.phone || formData.phone}
                                      </span>
                                      {isDefault && (
                                        <span className="cart-addr-default-tag">Mặc định</span>
                                      )}
                                    </div>
                                    <div className="cart-saved-addr-text">
                                      <EnvironmentOutlined style={{ color: "#94a3b8", marginRight: 6 }} />
                                      {fullAddressText || "Chưa có địa chỉ chi tiết"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="cart-addr-switch-row">
                            <button
                              type="button"
                              className="cart-btn-switch-manual"
                              onClick={() => setUseCustomAddress(true)}
                            >
                              + Giao đến địa chỉ khác (Nhập thủ công)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="cart-address-box">
                          {isAuthenticated && customerAddresses.length > 0 && (
                            <div className="cart-addr-back-to-saved">
                              <button
                                type="button"
                                className="cart-btn-back-saved"
                                onClick={() => setUseCustomAddress(false)}
                              >
                                ← Sử dụng địa chỉ đã lưu trong sổ địa chỉ
                              </button>
                            </div>
                          )}

                          <div className="cart-form-row-3">
                            <div className="cart-form-group">
                              <label>Tỉnh / Thành phố *</label>
                              <select
                                name="provinceId"
                                value={formData.provinceId}
                                onChange={handleProvinceChange}
                                disabled={loadingProvinces}
                                required
                              >
                                <option value="">
                                  {loadingProvinces ? "-- Đang tải tỉnh/thành... --" : "-- Chọn Tỉnh / Thành phố --"}
                                </option>
                                {provinces.map((prov) => (
                                  <option key={prov.ProvinceID} value={prov.ProvinceID}>
                                    {prov.ProvinceName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="cart-form-group">
                              <label>Quận / Huyện *</label>
                              <select
                                name="districtId"
                                value={formData.districtId}
                                onChange={handleDistrictChange}
                                disabled={!formData.provinceId || loadingDistricts}
                                required
                              >
                                <option value="">
                                  {loadingDistricts
                                    ? "-- Đang tải quận/huyện... --"
                                    : !formData.provinceId
                                    ? "-- Chọn Tỉnh/Thành trước --"
                                    : "-- Chọn Quận / Huyện --"}
                                </option>
                                {districts.map((dist) => (
                                  <option key={dist.DistrictID} value={dist.DistrictID}>
                                    {dist.DistrictName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="cart-form-group">
                              <label>Phường / Xã</label>
                              <select
                                name="wardCode"
                                value={formData.wardCode}
                                onChange={handleWardChange}
                                disabled={!formData.districtId || loadingWards}
                              >
                                <option value="">
                                  {loadingWards
                                    ? "-- Đang tải phường/xã... --"
                                    : !formData.districtId
                                    ? "-- Chọn Quận/Huyện trước --"
                                    : "-- Chọn Phường / Xã --"}
                                </option>
                                {wards.map((ward) => (
                                  <option key={ward.WardCode} value={ward.WardCode}>
                                    {ward.WardName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="cart-form-group">
                            <label>Địa chỉ công trình / Tòa nhà / Số nhà cụ thể *</label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Số nhà, tên đường, tên nhà máy, khu công nghiệp..."
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ghi chú */}
                  <div className="cart-form-group">
                    <label>Ghi chú cho đơn hàng (Tùy chọn)</label>
                    <textarea
                      name="note"
                      rows="2"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Yêu cầu về giờ giao hàng, hướng dẫn vào cổng nhà máy, quy cách đóng gói pallet..."
                    />
                  </div>

                  {/* Toggle xuất hóa đơn VAT */}
                  <div className="cart-vat-toggle">
                    <label className="cart-checkbox-label">
                      <input
                        type="checkbox"
                        name="needVat"
                        checked={formData.needVat}
                        onChange={handleInputChange}
                      />
                      <span>Yêu cầu xuất hóa đơn đỏ GTGT (VAT) cho Doanh nghiệp</span>
                    </label>

                    {formData.needVat && (
                      <div className="cart-vat-fields">
                        <div className="cart-form-group">
                          <label>Tên Công ty / Đơn vị nhận hóa đơn *</label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Công ty Cổ phần Xây dựng & PCCC..."
                          />
                        </div>
                        <div className="cart-form-row">
                          <div className="cart-form-group">
                            <label>Mã số thuế (MST) *</label>
                            <input
                              type="text"
                              name="taxCode"
                              value={formData.taxCode}
                              onChange={handleInputChange}
                              placeholder="Mã số thuế doanh nghiệp"
                            />
                          </div>
                          <div className="cart-form-group">
                            <label>Địa chỉ theo ĐKKD *</label>
                            <input
                              type="text"
                              name="companyAddress"
                              value={formData.companyAddress}
                              onChange={handleInputChange}
                              placeholder="Địa chỉ trụ sở công ty"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* KHỐI 3: Phương thức thanh toán */}
              <div className="cart-panel">
                <div className="cart-panel-header">
                  <div className="cart-panel-title">
                    <span className="cart-step-num">3</span>
                    <h3>Phương thức thanh toán</h3>
                  </div>
                </div>

                <div className="cart-panel-body">
                  <div className="cart-payment-options">
                    {/* COD */}
                    <label
                      className={`cart-pay-card ${
                        paymentMethod === "cod" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <div className="cart-pay-info">
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <span>
                          Nhận hàng, kiểm tra tem niêm phong và CO/CQ trước khi
                          thanh toán tiền mặt cho nhân viên giao hàng.
                        </span>
                      </div>
                    </label>

                    {/* Chuyển khoản ngân hàng */}
                    <label
                      className={`cart-pay-card ${
                        paymentMethod === "banking" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="banking"
                        checked={paymentMethod === "banking"}
                        onChange={() => setPaymentMethod("banking")}
                      />
                      <div className="cart-pay-info">
                        <strong>Chuyển khoản tài khoản Ngân hàng Doanh nghiệp</strong>
                        <span>
                          Chuyển khoản trực tiếp vào tài khoản Công ty TNHH Thành
                          Công Việt Nam. Có ủy nhiệm chi xác thực.
                        </span>
                        {paymentMethod === "banking" && (
                          <div className="cart-bank-detail">
                            <p>
                              • <strong>Ngân hàng:</strong> MBBank (Ngân hàng Quân Đội)
                            </p>
                            <p>
                              • <strong>Số tài khoản:</strong> 0904537559
                            </p>
                            <p>
                              • <strong>Chủ tài khoản:</strong> CÔNG TY TNHH THÀNH CÔNG VIỆT NAM
                            </p>
                            <p className="cart-bank-note">
                              Nội dung CK: [Số điện thoại] - Thanh toan don hang
                            </p>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Hợp đồng dự án / Công nợ */}
                    <label
                      className={`cart-pay-card ${
                        paymentMethod === "contract" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="contract"
                        checked={paymentMethod === "contract"}
                        onChange={() => setPaymentMethod("contract")}
                      />
                      <div className="cart-pay-info">
                        <strong>Hợp đồng nguyên tắc & Thanh toán theo tiến độ dự án</strong>
                        <span>
                          Áp dụng cho các nhà thầu PCCC, ban quản lý dự án thủy
                          điện, KCN cần ký hợp đồng kinh tế và xuất hóa đơn trước.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════
                CỘT PHẢI (35%): Tóm tắt đơn hàng (Sticky)
               ═════════════════════════════════════════════ */}
            <div className="cart-right-col">
              <div className="cart-summary-box">
                <h3 className="cart-summary-title">Tóm tắt đơn hàng</h3>

                {/* Danh sách rút gọn các sản phẩm */}
                <div className="cart-summary-mini-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-summary-mini-item">
                      <span className="cart-mini-name">
                        {item.name} <strong>x{item.quantity}</strong>
                      </span>
                      <span className="cart-mini-price">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-divider"></div>

                {/* Các dòng tính toán chi phí */}
                <div className="cart-calc-rows">
                  <div className="cart-calc-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="cart-calc-row">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {shippingFee === 0 ? (
                        <strong className="text-green">Miễn phí</strong>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="cart-summary-divider"></div>

                  <div className="cart-calc-row total-row">
                    <span>Tổng thanh toán:</span>
                    <span className="cart-final-price">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                  <span className="cart-vat-note">(Đã bao gồm VAT nếu có yêu cầu)</span>
                </div>

                {/* Đồng ý điều khoản */}
                <div className="cart-terms-check">
                  <label>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <span>
                      Tôi đồng ý với{" "}
                      <Link to="/gioi-thieu" target="_blank">
                        chính sách mua hàng & bảo hành
                      </Link>{" "}
                      của Thành Công Việt Nam
                    </span>
                  </label>
                </div>

                {/* Nút đặt hàng to */}
                <button
                  type="button"
                  onClick={handleInitiateOrder}
                  className="cart-btn-checkout"
                  disabled={isSubmitting}
                >
                  TIẾN HÀNH ĐẶT HÀNG
                </button>

                {/* Hotline tư vấn nhanh */}
                <div className="cart-summary-hotline">
                  <span>Cần hỗ trợ đặt hàng gấp hoặc thương thảo dự án?</span>
                  <a href="tel:0865130088">Hotline: 0865 130 088 (Zalo)</a>
                </div>

                {/* Cam kết của cửa hàng */}
                <div className="cart-trust-badges">
                  <div className="cart-trust-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#b91c1c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>100% Chính hãng Lion King CO/CQ</span>
                  </div>
                  <div className="cart-trust-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#b91c1c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Bảo hành chính hãng 12-24 tháng</span>
                  </div>
                  <div className="cart-trust-item">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#b91c1c"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                    <span>Giao hàng & Lắp đặt tận nơi toàn quốc</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: XÁC NHẬN ĐẶT HÀNG TRƯỚC KHI TẠO ĐƠN */}
      {showConfirmModal && pendingOrder && (
        <div className="cart-modal-overlay">
          <div className="cart-confirm-box">
            <div className="cart-confirm-header">
              <div className="cart-confirm-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <h3>Xác Nhận Đặt Hàng</h3>
                <p>Vui lòng kiểm tra lại thông tin nhận hàng và thanh toán</p>
              </div>
            </div>

            <div className="cart-confirm-grid">
              <div className="cart-confirm-row">
                <span className="cart-confirm-label">Khách hàng:</span>
                <span className="cart-confirm-value">{pendingOrder.customerName}</span>
              </div>
              <div className="cart-confirm-row">
                <span className="cart-confirm-label">Số điện thoại:</span>
                <span className="cart-confirm-value">{pendingOrder.phone}</span>
              </div>
              {pendingOrder.email ? (
                <div className="cart-confirm-row">
                  <span className="cart-confirm-label">Email:</span>
                  <span className="cart-confirm-value">{pendingOrder.email}</span>
                </div>
              ) : null}
              <div className="cart-confirm-row">
                <span className="cart-confirm-label">Hình thức nhận:</span>
                <span className="cart-confirm-value">{pendingOrder.deliveryMethodText}</span>
              </div>
              <div className="cart-confirm-row">
                <span className="cart-confirm-label">Địa chỉ giao:</span>
                <span className="cart-confirm-value">{pendingOrder.shippingAddress}</span>
              </div>
              <div className="cart-confirm-row">
                <span className="cart-confirm-label">Thanh toán:</span>
                <span className="cart-confirm-value">{pendingOrder.paymentMethodText}</span>
              </div>
              {pendingOrder.needVat ? (
                <div className="cart-confirm-row">
                  <span className="cart-confirm-label">Hóa đơn VAT:</span>
                  <span className="cart-confirm-value text-green">{pendingOrder.vatInfo}</span>
                </div>
              ) : null}
              {pendingOrder.note ? (
                <div className="cart-confirm-row">
                  <span className="cart-confirm-label">Ghi chú:</span>
                  <span className="cart-confirm-value">{pendingOrder.note}</span>
                </div>
              ) : null}
              <div className="cart-confirm-row">
                <span className="cart-confirm-label">Sản phẩm:</span>
                <span className="cart-confirm-value">{pendingOrder.itemCount} sản phẩm</span>
              </div>
            </div>

            <div className="cart-confirm-total-box">
              <span>Tổng tiền thanh toán:</span>
              <strong>{formatPrice(pendingOrder.total)}</strong>
            </div>

            <div className="cart-confirm-actions">
              <button
                type="button"
                className="cart-btn-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Quay lại kiểm tra
              </button>
              <button
                type="button"
                className="cart-btn-modal-submit"
                onClick={handleConfirmOrder}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Xác Nhận & Đặt Hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: HIỆU ỨNG LOADING VÀI GIÂY KHI XỬ LÝ ĐẶT HÀNG */}
      {isSubmitting && (
        <div className="cart-loading-overlay">
          <div className="cart-loading-card">
            <div className="cart-loading-spinner-wrap">
              <div className="cart-loading-spinner"></div>
              <div className="cart-loading-pulse"></div>
            </div>
            <h3>Đang Xử Lý Đơn Hàng...</h3>
            <p>
              Hệ thống đang kết nối máy chủ và tạo mã đơn hàng cho bạn, vui lòng không tắt trang web.
            </p>
            <div className="cart-loading-bar">
              <div className="cart-loading-bar-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: THÔNG BÁO ĐẶT HÀNG THÀNH CÔNG */}
      {orderSuccess && (
        <div className="cart-modal-overlay">
          <div className="cart-modal-box">
            <div className="cart-modal-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Đặt Hàng Thành Công!</h3>
            <p className="cart-modal-code">
              Mã đơn hàng: <strong>{orderSuccess.orderId}</strong>
            </p>
            <p className="cart-modal-desc">
              Cảm ơn <strong>{orderSuccess.customerName}</strong> đã tin tưởng lựa chọn
              Thành Công Việt Nam. Đội ngũ kỹ sư dự án sẽ liên hệ số điện thoại{" "}
              <strong>{orderSuccess.phone}</strong> trong vòng 15 phút để xác nhận cấu hình
              và tiến độ giao hàng
              {orderSuccess.address ? (
                <>
                  {" "}tới địa chỉ: <strong>{orderSuccess.address}</strong>
                </>
              ) : null}.
            </p>
            <div className="cart-modal-total">
              <span>Tổng thanh toán:</span>
              <strong>{formatPrice(orderSuccess.total)}</strong>
            </div>
            <div className="cart-modal-actions">
              <Link
                to="/"
                onClick={() => setOrderSuccess(null)}
                className="cart-btn-primary"
              >
                Về trang chủ
              </Link>
              <Link
                to="/san-pham"
                onClick={() => setOrderSuccess(null)}
                className="cart-btn-secondary"
              >
                Xem thêm sản phẩm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}