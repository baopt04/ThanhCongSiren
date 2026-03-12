import { ProductCard } from "../components/common/ProductCard/ProductCard";
import { ProductSection } from "../components/home/ProductSection";
import { ProductSelect } from "../components/home/ProductSelect";
import { Link } from "react-router-dom";
import "./FireAlarmPage.css";
export function FireAlarmPage() {
    const products = [
        {
            name: "Còi hú LK-JDW245PK",
            price: "31.990.000₫",
        },
        {
            name: "Còi hú báo cháy LK-200",
            price: "12.990.000₫",
        },
    ];

    return (
        <div className="siren-page">

            <div className="breadcrumb">
                <div className="breadcrumb-inner">
                    Trang chủ › Thiết bị báo cháy
                </div>
            </div>
            <div className="product-grid">
                {products.map((p) => (
                    <ProductSelect key={p.name} {...p} />
                ))}
            </div>
        </div>
    );
}