import "./Footer.css";

export function Footer() {
  return (
    <footer className="sd-footer">
      <div className="sd-footer-inner">

        {/* CỘT 1 */}
        <div className="sd-footer-col sd-footer-brand">
          <div className="sd-footer-logo">
            <img
              src="https://coihubaodong.com/templates/fashion01/assets/media/cropped-logo-coihubaodong-2.png"
              alt=""
              style={{ width: "60px", height: "50px" }}
            />
          </div>

          <p className="sd-footer-tt">
            Năm 2016, Công tý TNHH Thành Công trở thành đại lý ủy quyền của Lion King.
            Chúng tôi phát triển sản phẩm tiêu chuẩn của Lion King nhằm mang đến trải nghiệm tốt nhất về sản phẩm và dịch vụ của Lion King cho người dùng Việt Nam.
          </p>

          <p className="sd-footer-hotline">
            Hotline mua hàng:<strong className="sd-footer-phone-1">0865.130.088</strong>
          </p>
          <p className="sd-footer-hotline"> Hotline bảo hành:<strong className="sd-footer-phone-2">0865.130.088</strong> </p>
          <p className="sd-footer-hotline"> Bán hàng doanh nghiệp: <strong className="sd-footer-phone">0865.130.088</strong> </p>
        </div>

        {/* CỘT 2 */}
        <div className="sd-footer-col sd-footer-about">
          <h4>VỀ CHÚNG TÔI</h4>
          <ul>
            <li><a href="#">Giới thiệu</a></li>
            <li><a href="#">Sản phẩm</a></li>
            <li><a href="#">Tin tức</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>

        {/* CỘT 3 */}
        <div className="sd-footer-col sd-footer-policy">
          <h4>CHÍNH SÁCH</h4>
          <ul>
            <li><a href="#">Chính sách bảo hành</a></li>
            <li><a href="#">Chính sách giao hàng</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* CỘT 4 */}
        <div className="sd-footer-col sd-footer-company">
          <h4>CÔNG TY TNHH THÀNH CÔNG</h4>
          <ul>
            <li>Địa chỉ trụ sở: Số 7, Ngách 68/8, Tổ 2, Phường Phú Diễn, TP. Hà Nội</li>
            <li>Điện thoại: 0865.130.088</li>
            <li>Email: thanhcongvietnamco@gmail.com</li>
            <li>Website: coihubaodong.com</li>
            <li>MSDN: 0107552155 – Sở KH&ĐT Hà Nội cấp ngày 05-09-2016 – Đại diện : Đỗ văn Tuân</li>
          </ul>
        </div>

      </div>
    </footer>
  );
}