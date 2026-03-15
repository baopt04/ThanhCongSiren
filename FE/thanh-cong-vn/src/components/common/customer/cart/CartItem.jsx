import { useState } from "react";

export default function CartItem({ item }) {

    const [qty, setQty] = useState(1);

    const formatPrice = (price) =>
        price.toLocaleString("vi-VN") + "đ";

    return (
        <div className="cart-item">

            <div className="cart-item-left">

                <img src={item.image} alt="" />

                <span className="cart-remove">x Xóa</span>

            </div>

            <div className="cart-item-middle">

                <h3>{item.name}</h3>

                <p className="cart-color">Màu sắc: {item.color}</p>

                <div className="cart-colors">

                    <span className="color blue"></span>
                </div>

            </div>

            <div className="cart-item-right">

                <div className="cart-price">
                    {formatPrice(item.price)}
                </div>

            </div>

        </div>
    );
}