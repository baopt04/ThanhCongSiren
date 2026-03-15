import "./ProductSection.css";
import { ProductCard } from "../ProductCard/ProductCard";

const demoProducts = [
  {
    name: "Còi hú báo động công suất lớn báo xả lũ LK-JDW245PK",
    price: "31.990.000₫",
    oldPrice: "34.990.000₫",
    badge: "Giảm giá 10%",
    isNew: true,
  },
  {
    name: "iPhone 15 128GB",
    price: "21.990.000₫",
    oldPrice: "23.990.000₫",
    badge: "Giảm giá 50%",
    isNew: true,
  },
  {
    name: "iPhone 14 128GB",
    price: "17.990.000₫",
    oldPrice: "19.990.000₫",
    badge: "Giảm giá 15%",
    isNew: true,
  },
  {
    name: "iPhone 13 128GB",
    price: "15.990.000₫",
    isNew: true,
  },
];

export function ProductSection({ title }) {
  return (
    <section className="sd-product-section">
      <div className="sd-section-header">
        <h2>{title}</h2>
      </div>

      <div className="sd-product-grid">
        {demoProducts.map((p) => (
          <ProductCard key={p.name} {...p} />
        ))}
      </div>

      <div className="sd-view-more">
        <button className="sd-view-more-btn">
          Xem thêm <span className="arrow">›</span>
        </button>
      </div>
    </section>
  );
}

