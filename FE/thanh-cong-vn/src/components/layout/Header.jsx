import "./Header.css";
import { MenuOutlined, UserOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
const navItems = [
  { label: "DỊCH VỤ", path: "/services" },
  { label: "CÒI HÚ BÁO ĐỘNG", path: "/coi-hu-bao-dong" },
  { label: "THIẾT BỊ BÁO CHÁY", path: "/thiet-bi-bao-chay" },
  { label: "MÁY THỔI KHÍ", path: "/may-thoi-khi" },
  { label: "ĐỆM HƠI CỨU HỘ CỨU NẠN", path: "/dem-hoi-cuu-ho-cuu-nan" },
  { label: "TIN TỨC-VIDEO", path: "/tin-tuc" },
];

export function Header() {
  return (
    <header className="sd-header">
      <div className="sd-header-main">
        <div className="sd-header-logo">
          <span className="sd-logo">   <Link to="/">
            <img
              src="https://coihubaodong.com/templates/fashion01/assets/media/cropped-logo-coihubaodong-2.png"
              alt=""
              style={{ width: "60px", height: "50px" }} />
          </Link></span>
        </div>

        <div className="sd-header-search">
          <input
            type="text"
            placeholder="Bạn cần tìm gì hôm nay?"
            aria-label="Tìm kiếm sản phẩm"
          />
        </div>

        <div className="sd-header-actions">
          <button className="sd-header-action"><ShoppingCartOutlined style={{ marginRight: "5px", fontSize: "20px" }} />Giỏ hàng</button>
          <div className="sd-account-dropdown">
            <button className="sd-header-action">
              <UserOutlined style={{ marginRight: "5px", fontSize: "20px" }} />
              Tài khoản
            </button>

            <div className="sd-account-menu">
              <a href="/dang-nhap">Đăng nhập</a>
              <a href="/dang-ky">Đăng ký</a>
            </div>
          </div>
          <button className="sd-header-action sd-header-hotline">
            Hotline: 0865.130.088
          </button>
        </div>
      </div>

      <nav className="sd-header-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link to={item.path}>
                {item.label === "DỊCH VỤ" && (
                  <MenuOutlined className="menu-icon" />
                )}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

