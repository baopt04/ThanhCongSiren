import { FiShoppingCart } from "react-icons/fi";
import "./CartEmpty.css";
export default function CartEmpty() {
    return (
        <div className="cart-empty">
            <FiShoppingCart className="cart-empty-icon" />

            <p className="cart-empty-text">Chưa có sản phẩm nào!</p>

            <p className="cart-empty-support">
                Hỗ trợ mua hàng (8h - 22h)
            </p>
        </div>
    );
}