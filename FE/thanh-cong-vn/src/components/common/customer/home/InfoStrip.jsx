import { memo } from "react";
import "./InfoStrip.css";

export const InfoStrip = memo(function InfoStrip() {
  return (
    <section className="tc-info-strip-section" id="info-strip">
      <div className="tc-info-strip-container">
        {/* Card 1: ĐA DẠNG SẢN PHẨM */}
        <div className="tc-info-card-item">
          <div className="tc-info-card-icon-box">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 11l1.6-5.2A1.5 1.5 0 0 1 8 4.7h8a1.5 1.5 0 0 1 1.4 1.1L19 11" />
              <rect x="3" y="11" width="18" height="7" rx="2" />
              <circle cx="6.5" cy="14.5" r="1.5" fill="currentColor" />
              <circle cx="17.5" cy="14.5" r="1.5" fill="currentColor" />
              <line x1="10" y1="14.5" x2="14" y2="14.5" />
              <path d="M5 18v2M19 18v2" />
            </svg>
          </div>
          <div className="tc-info-card-content">
            <h2 className="tc-info-card-title">ĐA DẠNG SẢN PHẨM</h2>
            <p className="tc-info-card-desc">
              Còi hú báo động - Còi báo xả lũ - Còi báo cháy
            </p>
          </div>
        </div>

        {/* Card 2: CHẤT LƯỢNG HÀNG ĐẦU */}
        <div className="tc-info-card-item">
          <div className="tc-info-card-icon-box">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
              <path d="M10 4l2-2 2 2" />
              <path d="M10 20l2 2 2-2" />
              <path d="M4 10l-2 2 2 2" />
              <path d="M20 10l2 2-2 2" />
            </svg>
          </div>
          <div className="tc-info-card-content">
            <h2 className="tc-info-card-title">
              CHẤT LƯỢNG HÀNG<br />ĐẦU
            </h2>
            <p className="tc-info-card-desc">
              Sản phẩm được nhập khẩu 100%, cam kết uy tín từ nhà sản xuất.
            </p>
          </div>
        </div>

        {/* Card 3: BẢO HÀNH 12 THÁNG */}
        <div className="tc-info-card-item">
          <div className="tc-info-card-icon-box">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Gear top */}
              <g transform="translate(12, 6.5) scale(0.38)">
                <path d="M0 -7 L1.5 -7 L2 -5 L3.5 -4.5 L5 -6 L6 -5 L4.5 -3.5 L5 -2 L7 -1.5 L7 1.5 L5 2 L4.5 3.5 L6 5 L5 6 L3.5 4.5 L2 5 L1.5 7 L-1.5 7 L-2 5 L-3.5 4.5 L-5 6 L-6 5 L-4.5 3.5 L-5 2 L-7 1.5 L-7 -1.5 L-5 -2 L-4.5 -3.5 L-6 -5 L-5 -6 L-3.5 -4.5 L-2 -5 Z" />
                <circle cx="0" cy="0" r="2.8" fill="#a71d2a" />
              </g>
              {/* Gear bottom left */}
              <g transform="translate(7.5, 15.5) scale(0.36)">
                <path d="M0 -7 L1.5 -7 L2 -5 L3.5 -4.5 L5 -6 L6 -5 L4.5 -3.5 L5 -2 L7 -1.5 L7 1.5 L5 2 L4.5 3.5 L6 5 L5 6 L3.5 4.5 L2 5 L1.5 7 L-1.5 7 L-2 5 L-3.5 4.5 L-5 6 L-6 5 L-4.5 3.5 L-5 2 L-7 1.5 L-7 -1.5 L-5 -2 L-4.5 -3.5 L-6 -5 L-5 -6 L-3.5 -4.5 L-2 -5 Z" />
                <circle cx="0" cy="0" r="2.8" fill="#a71d2a" />
              </g>
              {/* Gear bottom right */}
              <g transform="translate(16.5, 15.5) scale(0.36)">
                <path d="M0 -7 L1.5 -7 L2 -5 L3.5 -4.5 L5 -6 L6 -5 L4.5 -3.5 L5 -2 L7 -1.5 L7 1.5 L5 2 L4.5 3.5 L6 5 L5 6 L3.5 4.5 L2 5 L1.5 7 L-1.5 7 L-2 5 L-3.5 4.5 L-5 6 L-6 5 L-4.5 3.5 L-5 2 L-7 1.5 L-7 -1.5 L-5 -2 L-4.5 -3.5 L-6 -5 L-5 -6 L-3.5 -4.5 L-2 -5 Z" />
                <circle cx="0" cy="0" r="2.8" fill="#a71d2a" />
              </g>
            </svg>
          </div>
          <div className="tc-info-card-content">
            <h2 className="tc-info-card-title">BẢO HÀNH 12 THÁNG</h2>
            <p className="tc-info-card-desc">
              Tất cả các sản phẩm đều được bảo hành miễn phí trong vòng 12 tháng.
            </p>
          </div>
        </div>

        {/* Card 4: GIAO HÀNG MIỄN PHÍ */}
        <div className="tc-info-card-item">
          <div className="tc-info-card-icon-box">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div className="tc-info-card-content">
            <h2 className="tc-info-card-title">GIAO HÀNG MIỄN PHÍ</h2>
            <p className="tc-info-card-desc">
              Miễn phí giao hàng nội thành Hà Nội với các đơn hàng trên 1 triệu đồng
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});
