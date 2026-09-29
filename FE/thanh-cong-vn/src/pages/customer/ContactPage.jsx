import { useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../../components/common/Seo";
import "./ContactPage.css";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Báo giá còi hú",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Vui lòng điền họ tên và số điện thoại!");
      return;
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({
      name: "",
      phone: "",
      email: "",
      subject: "Báo giá còi hú",
      message: "",
    });
  };

  return (
    <div className="contact-page-clean">
      <Seo
        title="Liên hệ báo giá"
        description="Liên hệ Công ty TNHH Thành Công Việt Nam — hotline 0865.130.088, email coihubaodong@gmail.com."
        path="/lien-he"
      />
      {/* 1. Breadcrumb */}
      <nav className="contact-nav-breadcrumb" aria-label="breadcrumb">
        <div className="contact-clean-container">
          <div className="contact-breadcrumb-trail">
            <Link to="/">Trang chủ</Link>
            <span className="contact-sep">/</span>
            <span className="contact-current">Liên hệ</span>
          </div>
        </div>
      </nav>

      <div className="contact-clean-container">
        {/* 2. Tiêu đề trang gọn gàng */}
        <div className="contact-header-simple">
          <span className="contact-badge-sub">THÀNH CÔNG VIỆT NAM</span>
          <h1>Liên Hệ Với Chúng Tôi</h1>
          <p>
            Đội ngũ chuyên viên kỹ thuật sẵn sàng hỗ trợ tư vấn giải pháp, khảo sát thực tế và báo giá thiết bị còi hú báo động & PCCC nhanh chóng.
          </p>
        </div>

        {/* 3. Bố cục chính: Thông tin bên trái + Form bên phải */}
        <div className="contact-main-row">
          {/* CỘT TRÁI: Thông tin công ty & Hotline */}
          <div className="contact-left-card">
            <div className="contact-company-top">
              <span className="contact-auth-tag">ĐẠI LÝ ỦY QUYỀN LION KING</span>
              <h2>CÔNG TY TNHH THÀNH CÔNG VIỆT NAM</h2>
              <p className="contact-mst-text">
                Mã số thuế: <strong>0107552155</strong> — Sở KH&ĐT TP. Hà Nội cấp ngày 05/09/2016
              </p>
            </div>

            <div className="contact-details-list">
              {/* Trụ sở chính */}
              <div className="contact-detail-item">
                <div className="contact-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Địa chỉ trụ sở chính:</span>
                  <p>Số 7, Ngách 68/8, Tổ 2, Phường Phú Diễn, Quận Bắc Từ Liêm, TP. Hà Nội</p>
                </div>
              </div>

              {/* Văn phòng làm việc */}
              <div className="contact-detail-item">
                <div className="contact-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Địa chỉ văn phòng giao dịch:</span>
                  <p>Số 9, Ngõ 68, Đường Phú Diễn, Quận Bắc Từ Liêm, TP. Hà Nội</p>
                </div>
              </div>

              {/* Hotline dự án */}
              <div className="contact-detail-item highlight">
                <div className="contact-item-icon hot">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Hotline tư vấn dự án & Zalo (24/7):</span>
                  <a href="tel:0865130088" className="contact-hotline-link">
                    0865.130.088
                  </a>
                </div>
              </div>

              {/* Điện thoại bàn */}
              <div className="contact-detail-item">
                <div className="contact-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Điện thoại văn phòng:</span>
                  <p>
                    <a href="tel:02466873822">024.6687.3822</a> — <a href="tel:0865130088">0865.130.088</a>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="contact-detail-item">
                <div className="contact-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Email báo giá & dự án:</span>
                  <p>
                    <a href="mailto:sieuthianninhviet@gmail.com">sieuthianninhviet@gmail.com</a>
                    <br />
                    <a href="mailto:thanhcongvietnamco@gmail.com">thanhcongvietnamco@gmail.com</a>
                  </p>
                </div>
              </div>

              {/* Thời gian làm việc */}
              <div className="contact-detail-item">
                <div className="contact-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Thời gian làm việc:</span>
                  <p>Thứ 2 – Thứ 7 (8h00 – 17h30) | Hotline hỗ trợ kỹ thuật 24/7</p>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="contact-quick-actions">
              <a href="tel:0865130088" className="contact-btn-red">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Gọi ngay 0865.130.088
              </a>
              <a
                href="https://zalo.me/0865130088"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn-outline"
              >
                Chat Zalo tư vấn
              </a>
            </div>
          </div>

          {/* CỘT PHẢI: Form gửi yêu cầu tư vấn */}
          <div className="contact-right-form">
            <div className="contact-form-head">
              <h3>Gửi Yêu Cầu Báo Giá & Tư Vấn</h3>
              <p>
                Vui lòng điền thông tin nhu cầu, chuyên viên của chúng tôi sẽ liên hệ lại trong vòng <strong>15 phút</strong>.
              </p>
            </div>

            {submitted && (
              <div className="contact-success-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Cảm ơn bạn! Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại sớm nhất!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-clean-form">
              <div className="contact-clean-row">
                <div className="contact-clean-group">
                  <label htmlFor="contact-name">Họ và tên *</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="contact-clean-group">
                  <label htmlFor="contact-phone">Số điện thoại *</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0904 537 559"
                    required
                  />
                </div>
              </div>

              <div className="contact-clean-row">
                <div className="contact-clean-group">
                  <label htmlFor="contact-email">Địa chỉ Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@congty.com"
                  />
                </div>
                <div className="contact-clean-group">
                  <label htmlFor="contact-subject">Thiết bị / Nhu cầu cần tư vấn</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="Còi báo xả lũ thủy điện">Còi báo xả lũ thủy điện / hồ chứa</option>
                    <option value="Còi hú công nghiệp">Còi hú công nghiệp / nhà máy</option>
                    <option value="Còi tầm phòng không đô thị">Còi tầm phòng không đô thị</option>
                    <option value="Còi chống cháy nổ hầm mỏ">Còi chống cháy nổ / hầm mỏ</option>
                    <option value="Tủ điều khiển còi hú GSM">Tủ điều khiển còi hú từ xa GSM/4G</option>
                    <option value="Thiết bị PCCC & Đệm hơi">Thiết bị PCCC & Đệm hơi CNCH</option>
                    <option value="Hồ sơ đấu thầu dự án">Tư vấn hồ sơ đấu thầu dự án</option>
                    <option value="Khác">Nhu cầu khác...</option>
                  </select>
                </div>
              </div>

              <div className="contact-clean-group">
                <label htmlFor="contact-message">Nội dung chi tiết yêu cầu *</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mô tả cụ thể: Quy mô công trình, bán kính cần cảnh báo, số lượng thiết bị, địa điểm lắp đặt..."
                  required
                />
              </div>

              <button type="submit" className="contact-btn-submit">
                GỬI YÊU CẦU BÁO GIÁ NGAY
              </button>
            </form>
          </div>
        </div>

        {/* 4. Bản đồ Google Maps nhúng rõ ràng */}
        <div className="contact-map-section">
          <div className="contact-map-box">
            <div className="contact-map-top">
              <div className="contact-map-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h3>Vị trí văn phòng giao dịch tại Hà Nội</h3>
              </div>
              <span className="contact-map-address">
                Số 9, Ngõ 68, Đường Phú Diễn, Phường Phú Diễn, Quận Bắc Từ Liêm, TP. Hà Nội
              </span>
            </div>

            <div className="contact-map-frame-wrapper">
              <iframe
                title="Bản đồ vị trí Công ty TNHH Thành Công Việt Nam"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.639893457198!2d105.76016797503173!3d21.047087680608566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454c602058e07%3A0x897914f65ce1e679!2zUGjDuiBEaeG7hW4sIELhuq9jIFThu6sgTGnDqm0sIEjDoCBO4buZaSwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* 5. Ba cam kết dịch vụ */}
        <div className="contact-trust-row">
          <div className="contact-trust-box">
            <div className="contact-trust-num">01</div>
            <h4>Phản Hồi Nhanh 15 Phút</h4>
            <p>Tiếp nhận và tư vấn thông số kỹ thuật, phương án âm lượng còi hú kịp thời cho dự án.</p>
          </div>
          <div className="contact-trust-box">
            <div className="contact-trust-num">02</div>
            <h4>100% Chính Hãng Lion King</h4>
            <p>Cung cấp đầy đủ chứng chỉ nguồn gốc (CO) và chất lượng (CQ), hỗ trợ pháp lý đấu thầu.</p>
          </div>
          <div className="contact-trust-box">
            <div className="contact-trust-num">03</div>
            <h4>Lắp Đặt & Bảo Hành Toàn Quốc</h4>
            <p>Kỹ sư hướng dẫn lắp đặt tận nơi, bảo hành 12-24 tháng và bảo dưỡng định kỳ dài hạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ContactPage;
