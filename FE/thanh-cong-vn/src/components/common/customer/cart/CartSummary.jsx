export default function CartSummary({ items }) {

    const total = items.reduce(
        (sum, item) => sum + item.price,
        0
    );

    const formatPrice = (price) =>
        price.toLocaleString("vi-VN") + "đ";

    return (
        <div className="cart-summary">

            <div className="cart-subtotal">
                Tạm tính (1 sản phẩm):
                <span>{formatPrice(total)}</span>
            </div>

            <hr />

            <div className="cart-customer">

                <h3>Thông tin khách hàng</h3>

                <div className="cart-gender">
                    <label>
                        <input type="radio" name="gender" defaultChecked />
                        Anh
                    </label>

                    <label>
                        <input type="radio" name="gender" />
                        Chị
                    </label>
                </div>

                <div className="cart-input-row">
                    <input placeholder="Họ và Tên" />
                    <input placeholder="Số điện thoại" />
                </div>

            </div>

            <hr />

            <div className="cart-delivery">

                <h3>Hình thức nhận hàng</h3>

                <div className="cart-delivery-options">
                    <label>
                        <input type="radio" name="delivery" defaultChecked />
                        Giao tận nơi
                    </label>

                    <label>
                        <input type="radio" name="delivery" />
                        Nhận tại cửa hàng
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

                <textarea placeholder="Nhập ghi chú (nếu có)" />

            </div>

        </div>
    );
}