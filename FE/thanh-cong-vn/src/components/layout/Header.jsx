import "./Header.css";
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  UnorderedListOutlined,
  DownOutlined,
  SafetyCertificateOutlined,
  LoadingOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  LockOutlined,
  MenuOutlined,
  CloseOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { Dropdown, message } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getCachedCustomerCategories } from "../../utils/categoriesCache";
import { searchProducts } from "../../services/customer/CustomerProductService";
import { getCartTotalQuantity } from "../../utils/cartUtils";
import { getCustomerUser, clearCustomerAuth, isCustomerAuthenticated } from "../../utils/auth";
import { getCartItems } from "../../services/customer/CustomerCartService";
import { PLACEHOLDER_IMAGE } from '../../utils/placeholder';

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

/**
 * Chuyển đổi dữ liệu API tree thành format cho Header dropdown
 * API: { id, name, slug, status, children: [...] }
 * Header cần: { label, slug, path, children: [{ label, slug, path }] }
 */
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
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(fallbackCategories);
  const [cartCount, setCartCount] = useState(() => getCartTotalQuantity());
  const [customerUser, setCustomerUser] = useState(() => getCustomerUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Search states
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setProductsExpanded(false);
    setExpandedMobileCat(null);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen((open) => {
      const next = !open;
      if (next) setMobileMenuOpen(false);
      return next;
    });
  };

  // Đóng menu mobile khi đổi route
  useEffect(() => {
    closeMobileMenu();
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Focus ô tìm kiếm khi mở trên mobile
  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

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

  const handleCustomerLogout = () => {
    clearCustomerAuth();
    message.success("Đã đăng xuất tài khoản thành công!");
    navigate("/");
  };

  // Sync cart badge count with backend / LocalStorage
  useEffect(() => {
    let isMounted = true;
    const syncCount = async (e) => {
      // Nếu sự kiện có truyền sẵn count từ trang CartPage thì cập nhật ngay, không cần gọi API
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

  // Debounce search with AbortController (~400ms)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchResults(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    // Cancel old in-flight request if user is still typing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchProducts(trimmed, controller.signal);
        const list = res?.data || (Array.isArray(res) ? res : []);
        setSearchResults(Array.isArray(list) ? list : []);
        setShowSearchResults(true);
      } catch (err) {
        if (
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        ) {
          // Request was aborted by newer search input, ignore
          return;
        }
        console.error("Error searching products:", err);
        setSearchResults([]);
      } finally {
        if (abortControllerRef.current === controller) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close search dropdown when location changes
  useEffect(() => {
    setShowSearchResults(false);
  }, [location.pathname]);

  const handleSelectProduct = (productId) => {
    setShowSearchResults(false);
    navigate(`/san-pham/${productId}`);
  };

  const getProductImage = (item) => {
    if (item.images?.imageUrl) return item.images.imageUrl;
    if (Array.isArray(item.image) && item.image[0]?.imageUrl) return item.image[0].imageUrl;
    if (item.imageUrl) return item.imageUrl;
    if (item.thumbnail) return item.thumbnail;
    return PLACEHOLDER_IMAGE;
  };

  const formatSearchPrice = (price) => {
    if (!price || Number(price) <= 0) return "Liên hệ báo giá";
    return `${Number(price).toLocaleString("vi-VN")} VND`;
  };

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
    return () => { isMounted = false; };
  }, []);

  return (
    <header className="tc-header" id="main-header">
      {/* Top Bar matching coihubaodong.com */}
      <div className="tc-header-top">
        <div className="tc-header-top-inner">
          <div className="tc-header-top-info">
            <span className="tc-company-badge">
              <SafetyCertificateOutlined /> CÔNG TY TNHH THÀNH CÔNG VIỆT NAM
            </span>
            <span className="tc-top-divider">|</span>
            <span className="tc-hotline-item">
              <PhoneOutlined /> Hotline tư vấn: <strong>0865.130.088</strong> - <strong>0364.862.148</strong>
            </span>
          </div>
          <div className="tc-header-top-right">
            <Link to="/tin-tuc">Dự án đã thi công</Link>
            <Link to="/gio-hang">Kiểm tra đơn hàng</Link>
            {customerUser ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "user-info",
                      label: (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 2px" }}>
                          {customerUser.avatar ? (
                            <img
                              src={customerUser.avatar}
                              alt="Avatar"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #e2e8f0",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "#fee2e2",
                                color: "#dc2626",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 15,
                                flexShrink: 0,
                              }}
                            >
                              {(customerUser.fullName || customerUser.email || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                              {customerUser.fullName || "Khách hàng"}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                              {customerUser.email}
                            </div>
                          </div>
                        </div>
                      ),
                      disabled: true,
                    },
                    { type: "divider" },
                    {
                      key: "my-profile",
                      icon: <UserOutlined />,
                      label: <Link to="/tai-khoan?tab=profile">Tài khoản của tôi</Link>,
                    },
                    {
                      key: "my-address",
                      icon: <EnvironmentOutlined />,
                      label: <Link to="/tai-khoan?tab=address">Địa chỉ nhận hàng</Link>,
                    },
                    {
                      key: "my-orders",
                      icon: <ShoppingOutlined />,
                      label: <Link to="/tai-khoan?tab=orders">Đơn mua</Link>,
                    },
                    {
                      key: "change-password",
                      icon: <LockOutlined />,
                      label: <Link to="/tai-khoan?tab=password">Đổi mật khẩu</Link>,
                    },
                    { type: "divider" },
                    ...(customerUser.role === "ADMIN"
                      ? [
                        {
                          key: "admin-panel",
                          icon: <SafetyCertificateOutlined />,
                          label: <Link to="/admin">Trang quản trị Admin</Link>,
                        },
                        { type: "divider" },
                      ]
                      : []),
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "Đăng xuất",
                      danger: true,
                      onClick: handleCustomerLogout,
                    },
                  ],
                }}
                placement="bottomRight"
                trigger={["click", "hover"]}
              >
                <span className="tc-top-user-btn">
                  {customerUser.avatar ? (
                    <img
                      src={customerUser.avatar}
                      alt="Avatar"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: 2,
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                    />
                  ) : (
                    <UserOutlined />
                  )}
                  <span className="tc-user-name">
                    {customerUser.fullName || customerUser.email}
                  </span>
                  <DownOutlined style={{ fontSize: 10 }} />
                </span>
              </Dropdown>
            ) : (
              <Link to="/dang-nhap" className="tc-top-login-btn">
                <UserOutlined /> Đăng nhập / Đăng ký
              </Link>
            )}
          </div>
        </div>
      </div>

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
            onError={(e) => {
              e.target.src = "https://coihubaodong.com/templates/fashion01/assets/media/cropped-logo-coihubaodong-2.png";
            }}
          />
          <div className="tc-logo-text">
            <span className="tc-logo-brand">THÀNH CÔNG VIỆT NAM</span>
            <span className="tc-logo-sub">Còi Hú Báo Động Công Suất Lớn • PCCC & CNCH</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div
          className={`tc-header-search ${mobileSearchOpen ? "is-mobile-open" : ""}`}
          ref={searchContainerRef}
        >
          <form
            className="tc-search-wrapper"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchResults.length > 0) {
                handleSelectProduct(searchResults[0].id);
              }
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim()) {
                  setShowSearchResults(true);
                }
              }}
              onFocus={() => {
                if (searchQuery.trim()) {
                  setShowSearchResults(true);
                }
              }}
              placeholder="Nhập tên sản phẩm (VD: LK-JDW400, Còi thủy điện...)"
              aria-label="Tìm kiếm sản phẩm"
              id="search-input"
              autoComplete="off"
            />
            <button type="submit" className="tc-search-btn" aria-label="Tìm kiếm">
              {isSearching ? <LoadingOutlined spin /> : <SearchOutlined />}
              <span>Tìm kiếm</span>
            </button>
            <button
              type="button"
              className="tc-search-close-mobile"
              aria-label="Đóng tìm kiếm"
              onClick={() => {
                setMobileSearchOpen(false);
                setShowSearchResults(false);
              }}
            >
              <CloseOutlined />
            </button>
          </form>

          {/* Dropdown danh sách kết quả tìm kiếm */}
          {showSearchResults && searchQuery.trim() && (
            <div className="tc-search-dropdown">
              <div className="tc-search-dropdown-header">
                <span>Sản phẩm</span>
                {isSearching && (
                  <span className="tc-search-dropdown-loading">
                    <LoadingOutlined spin /> Đang tìm...
                  </span>
                )}
              </div>

              <div className="tc-search-results-list">
                {isSearching && searchResults.length === 0 ? (
                  <div className="tc-search-status-box">
                    <LoadingOutlined spin style={{ fontSize: 18, color: "#b91c1c" }} />
                    <span>Đang tìm kiếm sản phẩm...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="tc-search-result-item"
                      onClick={() => handleSelectProduct(item.id)}
                    >
                      <div className="tc-search-item-img-wrap">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                      <div className="tc-search-item-info">
                        <div className="tc-search-item-name" title={item.name}>
                          {item.name?.trim()}
                        </div>
                        <div className="tc-search-item-price">
                          {formatSearchPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="tc-search-status-box tc-search-empty">
                    <span>Không tìm thấy sản phẩm phù hợp</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="tc-search-tags">
            <span>Từ khóa hot:</span>
            <Link to="/san-pham/coi-bao-dong-dong-co-dien-co-lon">Còi thủy điện</Link>
            <Link to="/san-pham/coi-hu-chong-chay-no">Còi chống cháy nổ</Link>
            <Link to="/san-pham/tu-dieu-khien">Tủ điều khiển GSM</Link>
            <Link to="/san-pham/may-thoi-khi">Quạt hút khói</Link>
          </div>
        </div>

        {/* Actions & Hotlines */}
        <div className="tc-header-actions">
          <div className="tc-header-contact-box">
            <div className="tc-contact-icon">
              <PhoneOutlined />
            </div>
            <div className="tc-contact-info">
              <span className="tc-contact-title">TƯ VẤN BÁO GIÁ</span>
              <a href="tel:0865130088" className="tc-contact-phone">0865.130.088</a>
            </div>
          </div>

          <button
            type="button"
            className={`tc-header-icon-btn tc-mobile-search-toggle ${mobileSearchOpen ? "is-active" : ""}`}
            aria-label={mobileSearchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
            aria-expanded={mobileSearchOpen}
            onClick={toggleMobileSearch}
          >
            {mobileSearchOpen ? <CloseOutlined className="tc-action-icon" /> : <SearchOutlined className="tc-action-icon" />}
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
      <nav className="tc-header-nav">
        <div className="tc-header-nav-inner">
          {/* Vertical Category Trigger Button */}
          <div
            className="tc-nav-category-trigger"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button className="tc-cat-btn">
              <UnorderedListOutlined />
              <span>DANH MỤC SẢN PHẨM</span>
              <DownOutlined className="tc-cat-arrow" />
            </button>

            {/* Dropdown Menu */}
            {showCategories && (
              <div className="tc-category-dropdown">
                <ul className="tc-cat-list">
                  {categories.map((cat, idx) => (
                    <li key={idx} className={`tc-cat-item ${cat.children && cat.children.length > 0 ? 'has-sub' : ''}`}>
                      <Link to={cat.path} onClick={() => setShowCategories(false)}>
                        <span>{cat.label}</span>
                        {cat.children && cat.children.length > 0 && <span className="tc-sub-arrow">›</span>}
                      </Link>

                      {cat.children && cat.children.length > 0 && (
                        <div className="tc-sub-dropdown">
                          <div className="tc-sub-header">{cat.label}</div>
                          {cat.children.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              to={sub.path}
                              className="tc-sub-item"
                              onClick={() => setShowCategories(false)}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Main Links */}
          <ul className="tc-main-nav-links">
            {mainNavItems.map((item) => (
              <li key={item.label} className={location.pathname === item.path ? "active" : ""}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>


        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`tc-mobile-drawer-backdrop ${mobileMenuOpen ? "is-open" : ""}`}
        onClick={closeMobileMenu}
        aria-hidden={!mobileMenuOpen}
      />
      <aside
        className={`tc-mobile-drawer ${mobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
        aria-label="Menu điều hướng"
      >
        <div className="tc-mobile-drawer-header">
          <span>Menu</span>
          <button type="button" className="tc-mobile-drawer-close" onClick={closeMobileMenu} aria-label="Đóng">
            <CloseOutlined />
          </button>
        </div>

        <div className="tc-mobile-drawer-body">
          <ul className="tc-mobile-nav-links">
            {mainNavItems.map((item) => {
              const isProducts = item.path === "/san-pham";
              const isActive =
                location.pathname === item.path ||
                (isProducts && location.pathname.startsWith("/san-pham"));

              if (isProducts) {
                return (
                  <li key={item.label} className={`tc-mobile-nav-group ${isActive ? "active" : ""}`}>
                    <div className="tc-mobile-nav-row">
                      <Link to={item.path} onClick={closeMobileMenu}>
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        className="tc-mobile-nav-plus"
                        aria-label={productsExpanded ? "Thu gọn sản phẩm" : "Mở danh mục sản phẩm"}
                        aria-expanded={productsExpanded}
                        onClick={() => {
                          setProductsExpanded((v) => !v);
                          if (productsExpanded) setExpandedMobileCat(null);
                        }}
                      >
                        {productsExpanded ? <MinusOutlined /> : <PlusOutlined />}
                      </button>
                    </div>

                    {productsExpanded && (
                      <ul className="tc-mobile-product-cats">
                        {categories.map((cat) => {
                          const hasChildren = cat.children && cat.children.length > 0;
                          const isExpanded = expandedMobileCat === cat.slug;
                          return (
                            <li key={cat.slug || cat.label}>
                              <div className="tc-mobile-cat-row">
                                <Link to={cat.path} onClick={closeMobileMenu}>
                                  {cat.label}
                                </Link>
                                {hasChildren && (
                                  <button
                                    type="button"
                                    className="tc-mobile-nav-plus tc-mobile-nav-plus-sm"
                                    aria-label="Mở danh mục con"
                                    onClick={() =>
                                      setExpandedMobileCat(isExpanded ? null : cat.slug)
                                    }
                                  >
                                    {isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                                  </button>
                                )}
                              </div>
                              {hasChildren && isExpanded && (
                                <ul className="tc-mobile-subcat-list">
                                  {cat.children.map((sub) => (
                                    <li key={sub.slug || sub.label}>
                                      <Link to={sub.path} onClick={closeMobileMenu}>
                                        {sub.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.label} className={isActive ? "active" : ""}>
                  <Link to={item.path} onClick={closeMobileMenu}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="tc-mobile-drawer-actions">
            <Link to="/lien-he" className="tc-mobile-action-link tc-mobile-quote" onClick={closeMobileMenu}>
              <SafetyCertificateOutlined /> Yêu cầu báo giá
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
