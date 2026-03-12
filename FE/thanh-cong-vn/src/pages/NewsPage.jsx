import News from "../components/common/News/News";
import { ProductSelect } from "../components/home/ProductSelect";
import { Link } from "react-router-dom";
import "./NewsPage.css";
export function NewsPage() {
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
                    Trang chủ › Tin tức - Video
                </div>
            </div>
            <News />
        </div>
    );
}