import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import {
  CloseOutlined,
  PlusOutlined,
  MinusOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export const HeaderMobileDrawer = memo(function HeaderMobileDrawer({
  isOpen,
  onClose,
  categories,
  currentPath,
  mainNavItems,
}) {
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }
    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [isOpen]);

  const handleClose = () => {
    setProductsExpanded(false);
    setExpandedMobileCat(null);
    onClose();
  };

  return (
    <>
      <div
        className={`tc-mobile-drawer-backdrop ${isOpen ? "is-open" : ""}`}
        onClick={handleClose}
        aria-hidden={!isOpen}
      />
      <aside
        className={`tc-mobile-drawer ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
        aria-label="Menu điều hướng"
      >
        <div className="tc-mobile-drawer-header">
          <span>Menu</span>
          <button
            type="button"
            className="tc-mobile-drawer-close"
            onClick={handleClose}
            aria-label="Đóng"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="tc-mobile-drawer-body">
          <ul className="tc-mobile-nav-links">
            {mainNavItems.map((item) => {
              const isProducts = item.path === "/san-pham";
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

              if (isProducts) {
                return (
                  <li
                    key={item.label}
                    className={`tc-mobile-nav-group ${isActive ? "active" : ""}`}
                  >
                    <div className="tc-mobile-nav-row">
                      <Link to={item.path} onClick={handleClose}>
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        className="tc-mobile-nav-plus"
                        aria-label={
                          productsExpanded
                            ? "Thu gọn sản phẩm"
                            : "Mở danh mục sản phẩm"
                        }
                        aria-expanded={productsExpanded}
                        onClick={() => {
                          setProductsExpanded((v) => !v);
                          if (productsExpanded) setExpandedMobileCat(null);
                        }}
                      >
                        {productsExpanded ? <MinusOutlined /> : <PlusOutlined />}
                      </button>
                    </div>

                    {productsExpanded && (
                      <ul className="tc-mobile-product-cats">
                        {categories.map((cat) => {
                          const hasChildren =
                            cat.children && cat.children.length > 0;
                          const isExpanded = expandedMobileCat === cat.slug;
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
                            <li key={cat.slug || cat.label}>
                              <div className={`tc-mobile-cat-row ${isCatActive ? "active" : ""}`}>
                                <Link to={cat.path} onClick={handleClose}>
                                  {cat.label}
                                </Link>
                                {hasChildren && (
                                  <button
                                    type="button"
                                    className="tc-mobile-nav-plus tc-mobile-nav-plus-sm"
                                    aria-label="Mở danh mục con"
                                    onClick={() =>
                                      setExpandedMobileCat(
                                        isExpanded ? null : cat.slug
                                      )
                                    }
                                  >
                                    {isExpanded ? (
                                      <MinusOutlined />
                                    ) : (
                                      <PlusOutlined />
                                    )}
                                  </button>
                                )}
                              </div>
                              {hasChildren && isExpanded && (
                                <ul className="tc-mobile-subcat-list">
                                  {cat.children.map((sub) => {
                                    const isSubActive =
                                      Boolean(
                                        sub.slug &&
                                          (currentPath === `/san-pham/${sub.slug}` ||
                                            currentPath.startsWith(`/san-pham/${sub.slug}/`))
                                      ) || Boolean(sub.path && currentPath === sub.path);

                                    return (
                                      <li key={sub.slug || sub.label}>
                                        <Link
                                          to={sub.path}
                                          className={isSubActive ? "active" : ""}
                                          onClick={handleClose}
                                        >
                                          {sub.label}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.label} className={isActive ? "active" : ""}>
                  <Link to={item.path} onClick={handleClose}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="tc-mobile-drawer-actions">
            <Link
              to="/lien-he"
              className="tc-mobile-action-link tc-mobile-quote"
              onClick={handleClose}
            >
              <SafetyCertificateOutlined /> Yêu cầu báo giá
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
});
