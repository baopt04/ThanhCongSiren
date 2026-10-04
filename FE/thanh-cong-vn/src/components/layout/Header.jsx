import "./Header.css";
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { getCachedCustomerCategories } from "../../utils/categoriesCache";
import { getCartTotalQuantity } from "../../utils/cartUtils";
import { getCustomerUser, clearCustomerAuth, isCustomerAuthenticated } from "../../utils/auth";
import { getCartItems } from "../../services/customer/CustomerCartService";

import { HeaderTopBar } from "./HeaderTopBar";
import { HeaderSearchBar } from "./HeaderSearchBar";
import { HeaderNav } from "./HeaderNav";
import { HeaderMobileDrawer } from "./HeaderMobileDrawer";

// Fallback danh mục khi API không trả dữ liệu
const fallbackCategories = [
  { label: "Tủ điều khiển", slug: "tu-dieu-khien", path: "/san-pham/tu-dieu-khien" },
  { label: "Bộ điều khiển", slug: "bo-dieu-khien", path: "/san-pham/bo-dieu-khien" },
  {
    label: "Còi báo động",
    slug: "coi-hu-bao-dong",
    path: "/san-pham/coi-hu-bao-dong",
    children: [
      { label: "Còi báo động động cơ điện cỡ lớn (Thủy điện / Quân đội)", slug: "coi-bao-dong-dong-co-dien-co-lon", path: "/san-pham/coi-bao-dong-dong-co-dien-co-lon" },
      { label: "Còi báo động chống cháy nổ (Lion King LK-EX)", slug: "coi-hu-chong-chay-no", path: "/san-pham/coi-hu-chong-chay-no" },
      { label: "Còi báo động động cơ điện cỡ nhỏ", slug: "coi-hu-co-nho", path: "/san-pham/coi-hu-co-nho" },
      { label: "Còi báo động quay tay di động", slug: "coi-bao-dong-quay-tay", path: "/san-pham/coi-bao-dong-quay-tay" }
    ]
  },
  {
    label: "Máy thổi khí",
    slug: "may-thoi-khi",
    path: "/san-pham/may-thoi-khi",
    children: [
      { label: "Máy thổi khí động cơ xăng", slug: "may-thoi-khi-dong-co-xang", path: "/san-pham/may-thoi-khi-dong-co-xang" },
      { label: "Máy thổi khí động cơ điện", slug: "may-thoi-khi-dong-co-dien", path: "/san-pham/may-thoi-khi-dong-co-dien" },
      { label: "Máy thổi khí áp lực nước", slug: "may-thoi-khi-ap-luc-nuoc", path: "/san-pham/may-thoi-khi-ap-luc-nuoc" },
      { label: "Ống dẫn khí & phụ kiện PCCC", slug: "ong-dan-khi-phu-kien", path: "/san-pham/ong-dan-khi-phu-kien" }
    ]
  },
  { label: "Thiết bị PCCC và CNCH", slug: "thiet-bi-bao-chay", path: "/san-pham/thiet-bi-bao-chay" },
  { label: "Đệm hơi cứu hộ cứu nạn", slug: "dem-hoi-cuu-ho-cuu-nan", path: "/san-pham/dem-hoi-cuu-ho-cuu-nan" },
  { label: "Còi Hú Xé Gió", slug: "coi-hu-xe-gio", path: "/san-pham/coi-hu-xe-gio" },
  { label: "Còi Báo Cháy", slug: "coi-bao-chay", path: "/san-pham/coi-bao-chay" },
  { label: "Còi Báo Giờ Tự Động", slug: "coi-bao-gio", path: "/san-pham/coi-bao-gio" },
  { label: "Còi Hú Chống Trộm", slug: "coi-hu-chong-trom", path: "/san-pham/coi-hu-chong-trom" },
  { label: "Quạt Thổi Khí & Quạt Hút Khói", slug: "quat-thoi-khi", path: "/san-pham/quat-thoi-khi" }
];

function mapApiToHeaderFormat(apiCategories) {
  return apiCategories
    .filter((cat) => cat.status === 1)
    .map((cat) => {
      const item = {
        label: cat.name,
        slug: cat.slug,
        path: `/san-pham/${cat.slug}`,
      };
      if (cat.children && cat.children.length > 0) {
        item.children = cat.children
          .filter((child) => child.status === 1)
          .map((child) => ({
            label: child.name,
            slug: child.slug,
            path: `/san-pham/${child.slug}`,
          }));
      }
      return item;
    });
}

const mainNavItems = [
  { label: "TRANG CHỦ", path: "/" },
  { label: "GIỚI THIỆU", path: "/gioi-thieu" },
  { label: "SẢN PHẨM", path: "/san-pham" },
  { label: "TIN TỨC - DỰ ÁN", path: "/tin-tuc" },
  { label: "LIÊN HỆ", path: "/lien-he" },
  { label: "THIẾT BỊ BÁO CHÁY", path: "/san-pham/thiet-bi-bao-chay" },
];

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState(fallbackCategories);
  const [cartCount, setCartCount] = useState(() => getCartTotalQuantity());
  const [customerUser, setCustomerUser] = useState(() => getCustomerUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleMobileSearch = useCallback(() => {
    setMobileSearchOpen((open) => {
      const next = !open;
      if (next) setMobileMenuOpen(false);
      return next;
    });
  }, []);

  // Đóng menu mobile khi đổi route
  useEffect(() => {
    closeMobileMenu();
    setMobileSearchOpen(false);
  }, [location.pathname, closeMobileMenu]);

  // Khóa scroll khi mở drawer
  useEffect(() => {
    document.body.classList.toggle("tc-scroll-lock", mobileMenuOpen);
    return () => document.body.classList.remove("tc-scroll-lock");
  }, [mobileMenuOpen]);

  // Sync customer authentication state
  useEffect(() => {
    const syncUser = () => {
      setCustomerUser(getCustomerUser());
    };
    window.addEventListener("customer-auth-changed", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("customer-auth-changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleCustomerLogout = useCallback(() => {
    clearCustomerAuth();
    message.success("Đã đăng xuất tài khoản thành công!");
    navigate("/");
  }, [navigate]);

  // Sync cart badge count with backend / LocalStorage
  useEffect(() => {
    let isMounted = true;
    const syncCount = async (e) => {
      if (e && e.detail && typeof e.detail.count === "number") {
        if (isMounted) setCartCount(e.detail.count);
        return;
      }

      if (isCustomerAuthenticated()) {
        try {
          const res = await getCartItems();
          const beQty = res?.data?.totalQuantity;
          if (isMounted && typeof beQty === "number") {
            setCartCount(beQty);
            return;
          }
        } catch {
          // fallback to local quantity
        }
      }
      if (isMounted) {
        setCartCount(getCartTotalQuantity());
      }
    };
    syncCount();
    window.addEventListener("tc_cart_updated", syncCount);
    window.addEventListener("storage", syncCount);
    return () => {
      isMounted = false;
      window.removeEventListener("tc_cart_updated", syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  // Load cached categories once
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await getCachedCustomerCategories();
        const data = res?.data || res?.result || res || [];
        const list = Array.isArray(data) ? data : [];
        if (isMounted && list.length > 0) {
          setCategories(mapApiToHeaderFormat(list));
        }
      } catch (error) {
        console.error("Error loading categories for Header:", error);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="tc-header" id="main-header">
      {/* Top Bar with hotline & account info */}
      <HeaderTopBar customerUser={customerUser} onLogout={handleCustomerLogout} />

      {/* Main Header */}
      <div className="tc-header-main">
        <button
          type="button"
          className="tc-mobile-menu-btn"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>

        <Link to="/" className="tc-header-logo" onClick={closeMobileMenu}>
          <img
            src="https://cdn0344.cdn4s.com/media/logo/cropped-logo-coihubaodong-2.png"
            alt="Thành Công Việt Nam - Còi hú báo động"
            decoding="async"
            onError={(e) => {
              e.target.src =
                "https://coihubaodong.com/templates/fashion01/assets/media/cropped-logo-coihubaodong-2.png";
            }}
          />
          <div className="tc-logo-text">
            <span className="tc-logo-brand">THÀNH CÔNG VIỆT NAM</span>
            <span className="tc-logo-sub">
              Còi Hú Báo Động Công Suất Lớn • PCCC & CNCH
            </span>
          </div>
        </Link>

        {/* Search Bar isolated component */}
        <HeaderSearchBar
          mobileSearchOpen={mobileSearchOpen}
          setMobileSearchOpen={setMobileSearchOpen}
        />

        {/* Actions & Hotlines */}
        <div className="tc-header-actions">
          <div className="tc-header-contact-box">
            <div className="tc-contact-icon">
              <PhoneOutlined />
            </div>
            <div className="tc-contact-info">
              <span className="tc-contact-title">TƯ VẤN BÁO GIÁ</span>
              <a href="tel:0865130088" className="tc-contact-phone">
                0865.130.088
              </a>
            </div>
          </div>

          <button
            type="button"
            className={`tc-header-icon-btn tc-mobile-search-toggle ${
              mobileSearchOpen ? "is-active" : ""
            }`}
            aria-label={mobileSearchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
            aria-expanded={mobileSearchOpen}
            onClick={toggleMobileSearch}
          >
            {mobileSearchOpen ? (
              <CloseOutlined className="tc-action-icon" />
            ) : (
              <SearchOutlined className="tc-action-icon" />
            )}
          </button>

          {customerUser ? (
            <Link
              to="/tai-khoan"
              className="tc-header-icon-btn tc-mobile-login-btn"
              aria-label="Tài khoản"
              title={customerUser.fullName || "Tài khoản"}
            >
              <UserOutlined className="tc-action-icon" />
            </Link>
          ) : (
            <Link
              to="/dang-nhap"
              className="tc-header-icon-btn tc-mobile-login-btn"
              aria-label="Đăng nhập"
              title="Đăng nhập"
            >
              <UserOutlined className="tc-action-icon" />
            </Link>
          )}

          <Link
            to="/gio-hang"
            className="tc-header-action-btn tc-cart-btn"
            id="cart-btn"
          >
            <div className="tc-cart-icon-wrapper">
              <ShoppingCartOutlined className="tc-action-icon" />
              <span className="tc-cart-count">{cartCount}</span>
            </div>
            <div className="tc-cart-text">
              <span className="tc-cart-label">Giỏ hàng</span>
              <span className="tc-cart-sub">{cartCount} sản phẩm</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Bar with Category Megamenu */}
      <HeaderNav
        categories={categories}
        currentPath={location.pathname}
        mainNavItems={mainNavItems}
      />

      {/* Mobile drawer */}
      <HeaderMobileDrawer
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        categories={categories}
        currentPath={location.pathname}
        mainNavItems={mainNavItems}
      />
    </header>
  );
}
