import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { UnorderedListOutlined, DownOutlined } from "@ant-design/icons";
import { preloadRouteChunks } from "../../utils/preloadChunks";
import {
  prefetchCustomerProductsPage,
  prefetchCustomerPosts,
} from "../../hooks/queries/customerQueries";

function handleHoverLink(path) {
  try {
    if (path === "/san-pham" || path?.startsWith("/san-pham")) {
      preloadRouteChunks.siren?.();
      prefetchCustomerProductsPage(0, 12);
    } else if (path === "/tin-tuc") {
      preloadRouteChunks.news?.();
      prefetchCustomerPosts();
    }
  } catch {
    // Ignore prefetch error
  }
}

export const HeaderNav = memo(function HeaderNav({
  categories,
  currentPath,
  mainNavItems,
}) {
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  return (
    <nav className="tc-header-nav">
      <div className="tc-header-nav-inner">
        {/* Main Links matching mockup */}
        <ul className="tc-main-nav-links">
          {mainNavItems.map((item) => {
            const isProductItem = item.path === "/san-pham";
            const isExactMatch = currentPath === item.path;
            const isPrefixMatch =
              item.path !== "/" &&
              currentPath?.startsWith(item.path + "/") &&
              !mainNavItems.some(
                (other) =>
                  other.path !== item.path &&
                  (currentPath === other.path || currentPath?.startsWith(other.path + "/"))
              );
            const isActive = isExactMatch || isPrefixMatch;

            return (
              <li
                key={item.label}
                className={`tc-nav-item ${isActive ? "active" : ""} ${
                  isProductItem ? "has-dropdown" : ""
                }`}
                onMouseEnter={() => isProductItem && setShowProductDropdown(true)}
                onMouseLeave={() => isProductItem && setShowProductDropdown(false)}
              >
                <Link
                  to={item.path}
                  onMouseEnter={() => handleHoverLink(item.path)}
                >
                  {item.label}
                  {isProductItem && <DownOutlined className="tc-nav-dropdown-arrow" />}
                </Link>

                {/* Submenu on hovering 'Sản phẩm' */}
                {isProductItem && showProductDropdown && categories && categories.length > 0 && (
                  <div className="tc-category-dropdown tc-nav-product-menu">
                    <ul className="tc-cat-list">
                      {categories.map((cat, idx) => {
                        const hasActiveChild = cat.children?.some(
                          (sub) =>
                            Boolean(
                              sub.slug &&
                                (currentPath === `/san-pham/${sub.slug}` ||
                                  currentPath.startsWith(`/san-pham/${sub.slug}/`))
                            ) || Boolean(sub.path && currentPath === sub.path)
                        );
                        const isCatActive =
                          Boolean(
                            cat.slug &&
                              (currentPath === `/san-pham/${cat.slug}` ||
                                currentPath.startsWith(`/san-pham/${cat.slug}/`))
                          ) ||
                          Boolean(cat.path && currentPath === cat.path) ||
                          Boolean(hasActiveChild);

                        return (
                          <li
                            key={cat.slug || idx}
                            className={`tc-cat-item ${isCatActive ? "active" : ""} ${
                              cat.children && cat.children.length > 0 ? "has-sub" : ""
                            }`}
                          >
                            <Link
                              to={cat.path}
                              onClick={() => setShowProductDropdown(false)}
                              onMouseEnter={() => handleHoverLink(cat.path)}
                            >
                              <span>{cat.label}</span>
                              {cat.children && cat.children.length > 0 && (
                                <span className="tc-sub-arrow">›</span>
                              )}
                            </Link>

                            {cat.children && cat.children.length > 0 && (
                              <div className="tc-sub-dropdown">
                                <div className="tc-sub-header">{cat.label}</div>
                                {cat.children.map((sub, sIdx) => {
                                  const isSubActive =
                                    Boolean(sub.slug && (currentPath === `/san-pham/${sub.slug}` || currentPath.startsWith(`/san-pham/${sub.slug}/`))) ||
                                    Boolean(sub.path && currentPath === sub.path);

                                  return (
                                    <Link
                                      key={sub.slug || sIdx}
                                      to={sub.path}
                                      className={`tc-sub-item ${isSubActive ? "active" : ""}`}
                                      onClick={() => setShowProductDropdown(false)}
                                      onMouseEnter={() => handleHoverLink(sub.path)}
                                    >
                                      {sub.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
});
