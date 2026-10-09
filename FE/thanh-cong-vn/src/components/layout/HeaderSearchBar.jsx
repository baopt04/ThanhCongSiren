import { useState, useEffect, useRef, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  SearchOutlined,
  LoadingOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { searchProducts } from "../../services/customer/CustomerProductService";
import { queryClient } from "../../config/queryClient";
import { PLACEHOLDER_IMAGE } from "../../utils/placeholder";
import { getProductPath } from "../../utils/slugUtils";

const getProductImage = (item) => {
  if (item.images?.imageUrl) return item.images.imageUrl;
  if (Array.isArray(item.image) && item.image[0]?.imageUrl) return item.image[0].imageUrl;
  if (item.imageUrl) return item.imageUrl;
  if (item.thumbnail) return item.thumbnail;
  return PLACEHOLDER_IMAGE;
};

const formatSearchPrice = (price) => {
  if (!price || Number(price) <= 0) return "Liên hệ báo giá";
  return `${Number(price).toLocaleString("vi-VN")} VND`;
};

export const HeaderSearchBar = memo(function HeaderSearchBar({
  mobileSearchOpen,
  setMobileSearchOpen,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Focus ô tìm kiếm khi mở trên mobile
  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  // Debounce search with AbortController (~350ms)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchResults(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    const cacheKey = ["customer", "search", trimmed.toLowerCase()];
    const cached = queryClient.getQueryData(cacheKey);
    if (cached) {
      setSearchResults(cached);
      setShowSearchResults(true);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchProducts(trimmed, controller.signal);
        const raw = res?.data || (Array.isArray(res) ? res : []);
        const list = Array.isArray(raw) ? raw : [];
        queryClient.setQueryData(cacheKey, list);
        setSearchResults(list);
        setShowSearchResults(true);
      } catch (err) {
        if (
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        ) {
          return;
        }
        console.error("Error searching products:", err);
        setSearchResults([]);
      } finally {
        if (abortControllerRef.current === controller) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (productOrId) => {
    setShowSearchResults(false);
    setSearchQuery("");
    if (setMobileSearchOpen) setMobileSearchOpen(false);
    navigate(getProductPath(productOrId));
  };

  return (
    <div
      className={`tc-header-search ${mobileSearchOpen ? "is-mobile-open" : ""}`}
      ref={searchContainerRef}
    >
      <form
        className="tc-search-wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          if (searchResults.length > 0) {
            handleSelectProduct(searchResults[0]);
          }
        }}
      >
        <label htmlFor="search-input" className="tc-sr-only">
          Tìm kiếm sản phẩm
        </label>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim()) {
              setShowSearchResults(true);
            }
          }}
          onFocus={() => {
            if (searchQuery.trim()) {
              setShowSearchResults(true);
            }
          }}
          placeholder="Bạn cần tìm thiết bị gì?"
          aria-label="Tìm kiếm sản phẩm"
          id="search-input"
          autoComplete="off"
        />
        <button type="submit" className="tc-search-btn" aria-label="Tìm">
          {isSearching ? <LoadingOutlined spin /> : null}
          <span>Tìm</span>
        </button>
        <button
          type="button"
          className="tc-search-close-mobile"
          aria-label="Đóng tìm kiếm"
          onClick={() => {
            if (setMobileSearchOpen) setMobileSearchOpen(false);
            setShowSearchResults(false);
          }}
        >
          <CloseOutlined />
        </button>
      </form>

      {/* Dropdown danh sách kết quả tìm kiếm */}
      {showSearchResults && searchQuery.trim() && (
        <div className="tc-search-dropdown">
          <div className="tc-search-dropdown-header">
            <span>Sản phẩm</span>
            {isSearching && (
              <span className="tc-search-dropdown-loading">
                <LoadingOutlined spin /> Đang tìm...
              </span>
            )}
          </div>

          <div className="tc-search-results-list">
            {isSearching && searchResults.length === 0 ? (
              <div className="tc-search-status-box">
                <LoadingOutlined spin style={{ fontSize: 18, color: "#b91c1c" }} />
                <span>Đang tìm kiếm sản phẩm...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((item) => (
                <div
                  key={item.id}
                  className="tc-search-result-item"
                  onClick={() => handleSelectProduct(item)}
                >
                  <div className="tc-search-item-img-wrap">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>
                  <div className="tc-search-item-info">
                    <div className="tc-search-item-name" title={item.name}>
                      {item.name?.trim()}
                    </div>
                    <div className="tc-search-item-price">
                      {formatSearchPrice(item.price)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="tc-search-status-box tc-search-empty">
                <span>Không tìm thấy sản phẩm phù hợp</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
