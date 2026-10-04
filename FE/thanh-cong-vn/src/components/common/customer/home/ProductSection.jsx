import "./ProductSection.css";
import { ProductCard } from "../ProductCard/ProductCard";
import { Link } from "react-router-dom";
import {
  RightOutlined,
  LeftOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useRef, memo } from "react";
import { categorySections } from "../../../../services/customer/CustomerProductService";

export const ProductSection = memo(function ProductSection({
  title,
  categorySlug,
  products: propProducts,
  loading: propLoading = false,
}) {
  const [internalProducts, setInternalProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    if (propProducts !== undefined) return;

    let isMounted = true;
    const fetchBySlug = async () => {
      try {
        setLoading(true);
        const res = await categorySections();
        const list = res?.data || (Array.isArray(res) ? res : []);
        const matched = list.find(
          (sec) =>
            (categorySlug && sec.categorySlug === categorySlug) ||
            (title &&
              sec.categoryName?.trim().toLowerCase() ===
                title?.trim().toLowerCase())
        );

        if (isMounted && matched?.products) {
          setInternalProducts(matched.products);
        }
      } catch (err) {
        console.error("Error fetching product section:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBySlug();
    return () => {
      isMounted = false;
    };
  }, [categorySlug, title, propProducts]);

  const displayProducts =
    propProducts !== undefined ? propProducts : internalProducts;
  const isLoading = propLoading || loading;

  const targetSlug = categorySlug || "all";
  const viewAllPath =
    targetSlug === "all" ? "/san-pham" : `/san-pham/${targetSlug}`;

  const updateScrollButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = trackRef.current;
    if (!el) return undefined;

    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [displayProducts, isLoading]);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".tc-product-slide");
    const amount = card ? card.offsetWidth * 2 + 12 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  if (!isLoading && (!displayProducts || displayProducts.length === 0)) {
    return null;
  }

  return (
    <section className="tc-home-section" id={`section-${targetSlug}`}>
      <div className="tc-section-container">
        <div className="tc-section-header">
          <div className="tc-section-tab-badge">
            <span>{title || "SẢN PHẨM"}</span>
          </div>
          <div className="tc-section-header-line"></div>
          <Link to={viewAllPath} className="tc-section-more-link">
            Xem tất cả <RightOutlined />
          </Link>
        </div>

        {isLoading ? (
          <div className="tc-product-loading">
            <LoadingOutlined spin style={{ fontSize: 28, color: "#d90429" }} />
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : (
          <div className="tc-product-slider-wrap">
            {canScrollLeft && (
              <button
                type="button"
                className="tc-slider-nav tc-slider-prev"
                onClick={() => scrollByCards(-1)}
                aria-label="Sản phẩm trước"
              >
                <LeftOutlined />
              </button>
            )}

            <div className="tc-product-slider" ref={trackRef}>
              {displayProducts.map((product) => (
                <div
                  className="tc-product-slide"
                  key={product.id || product.code || product.name}
                >
                  <ProductCard variant="catalog" {...product} />
                </div>
              ))}
            </div>

            {canScrollRight && (
              <button
                type="button"
                className="tc-slider-nav tc-slider-next"
                onClick={() => scrollByCards(1)}
                aria-label="Sản phẩm tiếp"
              >
                <RightOutlined />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
});
