import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { UnorderedListOutlined, DownOutlined } from "@ant-design/icons";

export const HeaderNav = memo(function HeaderNav({
  categories,
  currentPath,
  mainNavItems,
}) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <nav className="tc-header-nav">
      <div className="tc-header-nav-inner">
        {/* Vertical Category Trigger Button */}
        <div
          className="tc-nav-category-trigger"
          onMouseEnter={() => setShowCategories(true)}
          onMouseLeave={() => setShowCategories(false)}
        >
          <button className="tc-cat-btn" type="button">
            <UnorderedListOutlined />
            <span>DANH MỤC SẢN PHẨM</span>
            <DownOutlined className="tc-cat-arrow" />
          </button>

          {/* Dropdown Menu */}
          {showCategories && (
            <div className="tc-category-dropdown">
              <ul className="tc-cat-list">
                {categories.map((cat, idx) => (
                  <li
                    key={cat.slug || idx}
                    className={`tc-cat-item ${
                      cat.children && cat.children.length > 0 ? "has-sub" : ""
                    }`}
                  >
                    <Link to={cat.path} onClick={() => setShowCategories(false)}>
                      <span>{cat.label}</span>
                      {cat.children && cat.children.length > 0 && (
                        <span className="tc-sub-arrow">›</span>
                      )}
                    </Link>

                    {cat.children && cat.children.length > 0 && (
                      <div className="tc-sub-dropdown">
                        <div className="tc-sub-header">{cat.label}</div>
                        {cat.children.map((sub, sIdx) => (
                          <Link
                            key={sub.slug || sIdx}
                            to={sub.path}
                            className="tc-sub-item"
                            onClick={() => setShowCategories(false)}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Links */}
        <ul className="tc-main-nav-links">
          {mainNavItems.map((item) => (
            <li
              key={item.label}
              className={currentPath === item.path ? "active" : ""}
            >
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
});
