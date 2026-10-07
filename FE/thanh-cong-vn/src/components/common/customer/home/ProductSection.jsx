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
          <div className="tc-product-slider-wrap">
            <div className="tc-product-slider" style={{ overflow: "hidden" }}>
              {[1, 2, 3, 4].map((i) => (
                <div className="tc-product-slide" key={i}>
                  <div className="tc-catalog-card tc-card-skeleton">
                    <div className="tc-catalog-thumb-box tc-sk-thumb">
                      <div className="tc-skeleton-shimmer" style={{ width: "100%", height: "100%" }} />
                    </div>
                    <div className="tc-catalog-content" style={{ padding: 12 }}>
                      <div className="tc-skeleton-shimmer" style={{ height: 16, width: "85%", marginBottom: 8 }} />
                      <div className="tc-skeleton-shimmer" style={{ height: 12, width: "50%", marginBottom: 12 }} />
                      <div className="tc-skeleton-shimmer" style={{ height: 18, width: "60%" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

export function ProductSectionSkeleton({ title = "SẢN PHẨM" }) {
  return (
    <section className="tc-home-section" aria-hidden="true">
      <div className="tc-section-container">
        <div className="tc-section-header">
          <div className="tc-section-tab-badge">
            <span>{title}</span>
          </div>
          <div className="tc-section-header-line"></div>
        </div>

        <div className="tc-product-slider-wrap">
          <div className="tc-product-slider" style={{ overflow: "hidden" }}>
            {[1, 2, 3, 4].map((i) => (
              <div className="tc-product-slide" key={i}>
                <div className="tc-catalog-card tc-card-skeleton">
                  <div className="tc-catalog-thumb-box tc-sk-thumb">
                    <div className="tc-skeleton-shimmer" style={{ width: "100%", height: "100%" }} />
                  </div>
                  <div className="tc-catalog-content" style={{ padding: 12 }}>
                    <div className="tc-skeleton-shimmer" style={{ height: 16, width: "85%", marginBottom: 8 }} />
                    <div className="tc-skeleton-shimmer" style={{ height: 12, width: "50%", marginBottom: 12 }} />
                    <div className="tc-skeleton-shimmer" style={{ height: 18, width: "60%" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
