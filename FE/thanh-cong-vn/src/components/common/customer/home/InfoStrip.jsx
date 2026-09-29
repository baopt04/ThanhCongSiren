import "./InfoStrip.css";

const infoItems = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: "CHẤT LƯỢNG CAM KẾT",
    sub: "Sản phẩm nhập khẩu 100%, chính hãng Lion King",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="m16 8 4 2.5v5L16 16"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: "GIAO HÀNG TOÀN QUỐC",
    sub: "Miễn phí nội thành HN với đơn từ 1 triệu",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: "BẢO HÀNH 12 THÁNG",
    sub: "Bảo hành miễn phí, hỗ trợ kỹ thuật trọn đời",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    title: "TƯ VẤN MIỄN PHÍ",
    sub: "Hotline 0865.130.088 — hỗ trợ 24/7",
  },
];

export function InfoStrip() {
  return (
    <section className="tc-info-strip" id="info-strip">
      {infoItems.map((item, i) => (
        <div className="tc-info-item" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="tc-info-icon">{item.icon}</div>
          <div className="tc-info-content">
            <span className="tc-info-title">{item.title}</span>
            <span className="tc-info-sub">{item.sub}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
