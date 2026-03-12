import "./ProductCard.css";

export function ProductCard({ name, price, oldPrice, badge, isNew }) {
  return (
    <div className="sd-product-card">
      <img
        className="sd-product-price-ratio"
        src="https://shopdunk.com/images/uploaded-source/icon/price-ratio.png"
        alt=""
      />
      {badge && <div className="sd-product-badge">{badge}</div>}
      {isNew && (
        <img
          className="sd-product-new"
          src="https://shopdunk.com/images/uploaded/icon/new.png"
          alt="Mới"
        />
      )}

      <div className="sd-product-thumb">
        <img
          src="https://cdn0344.cdn4s.com/media/2022/coi%20bao%20dong/jdw245pk/coi-hu-bao-xa-lu-lap-dat-tai-nha-dieu-hanh-thuy-dien-sapa.jpg"
          alt=""
        />
      </div>

      <div className="sd-product-info">
        <div className="sd-product-name">{name}</div>

        <div className="sd-product-price-row">
          <span className="sd-product-price">{price}</span>
          {oldPrice && (
            <span className="sd-product-old-price">{oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}