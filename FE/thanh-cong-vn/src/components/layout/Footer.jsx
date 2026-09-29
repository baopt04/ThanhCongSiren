import "./Footer.css";
import { Link } from "react-router-dom";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

export function Footer() {
  return (
    <footer className="tc-footer" id="main-footer">
      <div className="tc-footer-inner">

        {/* CỘT 1 — Corporate Brand Info */}
        <div className="tc-footer-col tc-footer-brand">
          <div className="tc-footer-logo">
            <img
              src="https://cdn0344.cdn4s.com/media/logo/cropped-logo-coihubaodong-2.png"
              alt="CÔNG TY TNHH THÀNH CÔNG VIỆT NAM"
              onError={(e) => {
                e.target.src = "https://coihubaodong.com/templates/fashion01/assets/media/cropped-logo-coihubaodong-2.png";
              }}
            />
            <div className="tc-footer-logo-text">
              <span className="tc-footer-brand-name">THÀNH CÔNG VIỆT NAM</span>
              <span className="tc-footer-brand-sub">Nhà cung cấp Còi Hú & Thiết bị PCCC hàng đầu</span>
            </div>
          </div>

          <p className="tc-footer-desc">
            Công ty TNHH Thành Công Việt Nam là đại lý ủy quyền phân phối chính hãng thương hiệu <strong>Lion King</strong> tại Việt Nam. Chuyên cung cấp còi hú báo động công suất lớn cho hồ thủy điện, trạm cảnh báo thiên tai, khu quân sự, mỏ khoáng sản và thiết bị PCCC - CNCH.
          </p>

          <div className="tc-footer-contact-list">
            <div className="tc-footer-contact-item">
              <PhoneOutlined className="tc-foot-icon" />
              <span>Hotline dự án / Zalo: <a href="tel:0865130088" className="tc-footer-phone">0865.130.088</a></span>
            </div>
            <div className="tc-footer-contact-item">
              <PhoneOutlined className="tc-foot-icon" />
              <span>Điện thoại văn phòng: <a href="tel:02466873822" className="tc-footer-phone">02466.873.822</a> - <a href="tel:0865130088" className="tc-footer-phone">0865.130.088</a></span>
            </div>
            <div className="tc-footer-contact-item">
              <MailOutlined className="tc-foot-icon" />
              <span>Email báo giá: <a href="mailto:coihubaodong@gmail.com" className="tc-footer-phone">coihubaodong@gmail.com</a></span>
            </div>
            <div className="tc-footer-contact-item">
              <EnvironmentOutlined className="tc-foot-icon" />
              <span>Địa chỉ: TP. Hà Nội, Việt Nam</span>
            </div>
          </div>
        </div>

        {/* CỘT 2 — Danh mục còi hú */}
        <div className="tc-footer-col">
          <h4>CÒI HÚ BÁO ĐỘNG</h4>
          <ul>
            <li><Link to="/san-pham">Còi hú xả lũ thủy điện</Link></li>
            <li><Link to="/san-pham">Còi động cơ chống cháy nổ</Link></li>
            <li><Link to="/san-pham">Còi báo động quay tay</Link></li>
            <li><Link to="/san-pham">Còi hú động cơ cỡ nhỏ</Link></li>
            <li><Link to="/san-pham">Còi hú xé gió công suất lớn</Link></li>
            <li><Link to="/san-pham">Còi hú chống trộm</Link></li>
          </ul>
        </div>

        {/* CỘT 3 — Tủ điều khiển & PCCC */}
        <div className="tc-footer-col">
          <h4>TỦ ĐIỀU KHIỂN & PCCC</h4>
          <ul>
            <li><Link to="/san-pham">Tủ điều khiển còi hú GSM / 4G</Link></li>
            <li><Link to="/san-pham">Bộ điều khiển hẹn giờ tự động</Link></li>
            <li><Link to="/may-thoi-khi">Máy thổi khí PCCC (Xăng/Điện)</Link></li>
            <li><Link to="/may-thoi-khi">Quạt hút khói di động PCCC</Link></li>
            <li><Link to="/dem-hoi-cuu-ho-cuu-nan">Đệm hơi cứu hộ cứu nạn</Link></li>
            <li><Link to="/thiet-bi-bao-chay">Thiết bị báo cháy tự động</Link></li>
          </ul>
        </div>

        {/* CỘT 4 — Cam kết & Hồ sơ */}
        <div className="tc-footer-col">
          <h4>CAM KẾT & HỖ TRỢ</h4>
          <ul className="tc-guarantee-list">
            <li><SafetyCertificateOutlined className="tc-check-ic" /> Cung cấp CO/CQ chứng nhận gốc</li>
            <li><SafetyCertificateOutlined className="tc-check-ic" /> Nhập khẩu trực tiếp Lion King</li>
            <li><SafetyCertificateOutlined className="tc-check-ic" /> Hỗ trợ hồ sơ đấu thầu dự án</li>
            <li><SafetyCertificateOutlined className="tc-check-ic" /> Bảo hành chính hãng 12-24 tháng</li>
            <li><SafetyCertificateOutlined className="tc-check-ic" /> Hướng dẫn lắp đặt tận nơi</li>
          </ul>
        </div>

      </div>

      {/* Bottom Legal Notice Bar */}
      <div className="tc-footer-bottom">
        <div className="tc-footer-bottom-inner">
          <p>© 2016 – 2026 CÔNG TY TNHH THÀNH CÔNG VIỆT NAM. Hệ thống phân phối Còi Hú Báo Động & Thiết Bị PCCC độc quyền Lion King tại Việt Nam.</p>
          <p>Mã số doanh nghiệp: 0107552155 — Sở KH&ĐT Hà Nội cấp ngày 05/09/2016.</p>
        </div>
      </div>
    </footer>
  );
}