import "./InfoStrip.css";

export function InfoStrip() {
  return (
    <section className="sd-info-strip">
      <div className="sd-info-item">
        <div className="sd-info-icon">
          🔊
        </div>
        <div className="sd-info-content">
          <span className="sd-info-title">ĐA DẠNG SẢN PHẨM</span>
          <span className="sd-info-sub">
            Còi hú báo động - Còi báo xả lũ - Còi báo cháy
          </span>
        </div>
      </div>
      <div className="sd-info-item">
        <div className="sd-info-icon">
          🔊
        </div>
        <div className="sd-info-content">
          <span className="sd-info-title">CHẤT LƯỢNG HÀNG ĐẦU</span>
          <span className="sd-info-sub">Sản phẩm được nhập khẩu 100%, cam kết uy tín từ nhà sản xuất.</span>
        </div>
      </div>

      <div className="sd-info-item">
        <div className="sd-info-icon">
          🔊
        </div>
        <div className="sd-info-content">
          <span className="sd-info-title">BẢO HÀNH 12 THÁNG</span>
          <span className="sd-info-sub">Tất cả các sản phẩm đều được bảo hành miễn phí trong vòng 12 tháng.</span>
        </div>
      </div>
      <div className="sd-info-item">
        <div className="sd-info-icon">
          🔊
        </div>
        <div className="sd-info-content">
          <span className="sd-info-title">GIAO HÀNG MIỄN PHÍ</span>
          <span className="sd-info-sub">Miễn phí giao hàng nội thành Hà Nội với các đơn hàng trên 1 triệu đồng.</span>
        </div>
      </div>
    </section>
  );
}

