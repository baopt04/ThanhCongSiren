import CartItem from "../components/common/cart/CartItem";
import "./CartPage.css";
export default function CartPage() {

    const cartItems = [
        {
            id: 1,
            name: "Còi hú LK-JDW245PK",
            price: 17790000,
            color: "Đỏ",
            image: "https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-bao-dong-lk-jdw245pk-lap-tai-nha-may-thuy-dien-song-hinh.jpg"
        }
    ];

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    const formatPrice = (price) =>
        price.toLocaleString("vi-VN") + "đ";

    return (
        <div className="cart-page">

            <div className="cart-header">
                <span>← Về trang chủ</span>
                <span>Giỏ hàng của bạn</span>
            </div>

            {/* BOX 1: SẢN PHẨM */}

            <div className="cart-box">

                {cartItems.map(item => (
                    <CartItem key={item.id} item={item} />
                ))}

                <div className="cart-subtotal">
                    Tạm tính (1 sản phẩm):
                    <span>{formatPrice(total)}</span>
                </div>

            </div>

            {/* BOX 2: KHÁCH HÀNG */}

            <div className="cart-box">

                <h3>Thông tin khách hàng</h3>

                <div className="cart-gender">
                    <label>
                        <input type="radio" name="gender" /> Anh
                    </label>

                    <label>
                        <input type="radio" name="gender" /> Chị
                    </label>
                </div>
                <div className="cart-input-row">
                    <input placeholder="Họ và tên" />
                    <input placeholder="Số điện thoại" />
                </div>

            </div>

            {/* BOX 3: NHẬN HÀNG + THANH TOÁN */}

            <div className="cart-box">

                <h3>Hình thức nhận hàng</h3>

                <div className="cart-delivery-options">
                    <label>
                        <input type="radio" name="delivery" /> Giao tận nơi
                    </label>

                    <label>
                        <input type="radio" name="delivery" /> Nhận tại cửa hàng
                    </label>
                </div>

                <div className="cart-address">

                    <select>
                        <option>Chọn tỉnh, thành phố</option>
                    </select>

                    <select>
                        <option>Chọn quận, huyện</option>
                    </select>

                    <input placeholder="Địa chỉ cụ thể" />

                </div>
                <input placeholder="Thêm ghi chú(nếu có)" className="cart-note" />
                <div className="cart-total">
                    Tổng tiền:
                    <span>{formatPrice(total)}</span>
                </div>
                <div className="cart-clause">
                    <input type="checkbox" checked /> Tôi đã đọc và đồng ý với <a href="#">điều khoản dịch vụ</a> của chúng tôi.
                </div>

                <button className="cart-order-btn">
                    Tiến hành đặt hàng
                </button>

            </div>

        </div>
    );
}