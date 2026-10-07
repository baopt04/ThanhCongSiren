import { useState, useEffect, useMemo, memo } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LoadingOutlined,
  CalendarOutlined,
  UserOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  CopyOutlined,
  CheckOutlined,
  TagOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FacebookOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useCustomerPostsQuery } from "../../hooks/queries/customerQueries";
import { embedYoutubeInHtml } from "../../utils/youtubeUtils";
import { Seo } from "../../components/common/Seo";
import "./NewsDetailPage.css";

function formatPubDate(publishedAt) {
  if (!publishedAt) return "";
  try {
    const d = new Date(publishedAt);
    if (isNaN(d.getTime())) return publishedAt;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  } catch {
    return publishedAt;
  }
}

function mapPost(found) {
  return {
    id: found.id,
    slug: found.slug,
    title: found.title,
    category: found.categoryNews?.[0]?.name || "Tin tức & Kiến thức PCCC",
    date: formatPubDate(found.publishedAt),
    author: "Ban Kỹ Thuật — Thành Công VN",
    thumbnail: found.thumbnailUrl || "",
    excerpt: found.excerpt || "",
    tags: found.categoryNews?.map((c) => c.name).filter(Boolean) || [],
    contentHtml: found.content || "",
  };
}


/**
 * Memoized article body — tránh parse DOMParser mỗi lần parent re-render.
 * Chỉ re-compute khi html content thay đổi.
 */
const ArticleContent = memo(function ArticleContent({ html }) {
  const processedHtml = useMemo(() => embedYoutubeInHtml(html), [html]);
  return (
    <div
      className="news-article-body tc-article-content"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
});

export function NewsDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [article, setArticle] = useState(null);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Xác định URL danh sách tin tức trước đó để quay lại đúng trang & bộ lọc
  const savedPage =
    location.state?.fromPage ||
    sessionStorage.getItem("tc_news_page") ||
    "1";
  const savedCat =
    location.state?.fromCategory ||
    sessionStorage.getItem("tc_news_category") ||
    "all";
  const savedSearch =
    location.state?.fromSearch ||
    sessionStorage.getItem("tc_news_search") ||
    "";

  const backNewsUrl = useMemo(() => {
    let url = "/tin-tuc";
    const params = new URLSearchParams();
    if (savedPage && String(savedPage) !== "1") params.set("page", String(savedPage));
    if (savedCat && savedCat !== "all") params.set("category", savedCat);
    if (savedSearch && savedSearch.trim()) params.set("search", savedSearch.trim());
    const paramStr = params.toString();
    return paramStr ? `${url}?${paramStr}` : url;
  }, [savedPage, savedCat, savedSearch]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(backNewsUrl);
    }
  };

  const { data: postsList = [], isLoading: postsLoading } = useCustomerPostsQuery();

  useEffect(() => {
    if (postsLoading) {
      setLoading(true);
      return;
    }
    setLoading(false);
    setNotFound(false);

    const list = Array.isArray(postsList) ? postsList : [];
    const foundIndex = list.findIndex(
      (item) => item.slug === slug || String(item.id) === String(slug)
    );

    if (foundIndex !== -1) {
      const found = list[foundIndex];
      setArticle(mapPost(found));

      // Bài trước và bài tiếp theo
      setPrevPost(
        foundIndex > 0
          ? {
            slug: list[foundIndex - 1].slug || list[foundIndex - 1].id,
            title: list[foundIndex - 1].title,
          }
          : null
      );
      setNextPost(
        foundIndex < list.length - 1
          ? {
            slug: list[foundIndex + 1].slug || list[foundIndex + 1].id,
            title: list[foundIndex + 1].title,
          }
          : null
      );

      // Các bài viết khác cho Sidebar & Related
      const otherPosts = list.filter(
        (item) => item.slug !== found.slug && item.id !== found.id
      );

      setRelated(
        otherPosts.map((item) => ({
          slug: item.slug || item.id,
          title: item.title,
          date: formatPubDate(item.publishedAt),
          image: item.thumbnailUrl || "",
          category: item.categoryNews?.[0]?.name || "Tin tức PCCC",
        }))
      );
    } else if (list.length > 0) {
      setArticle(null);
      setNotFound(true);
      setPrevPost(null);
      setNextPost(null);
      setRelated(
        list.slice(0, 6).map((item) => ({
          slug: item.slug || item.id,
          title: item.title,
          date: formatPubDate(item.publishedAt),
          image: item.thumbnailUrl || "",
          category: item.categoryNews?.[0]?.name || "Tin tức PCCC",
        }))
      );
    }
  }, [slug, postsList, postsLoading]);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "width=600,height=450,scrollbars=yes,resizable=yes"
    );
  };

  const handleShareZalo = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://sp.zalo.me/share_inline?link=${url}`,
      "_blank",
      "width=600,height=500,scrollbars=yes,resizable=yes"
    );
  };

  if (loading) {
    return (
      <div className="news-detail-page news-detail-loading-state">
        <LoadingOutlined spin style={{ fontSize: 38, color: "#b91c1c" }} />
        <p className="news-loading-text">Đang tải nội dung bài viết...</p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="news-detail-page">
        <Seo title="Không tìm thấy bài viết" noindex />
        <nav className="news-detail-breadcrumb" aria-label="breadcrumb">
          <div className="news-detail-breadcrumb-inner">
            <button
              type="button"
              className="news-breadcrumb-back-btn"
              onClick={handleGoBack}
            >
              <ArrowLeftOutlined /> Quay lại
            </button>
            <span className="news-detail-sep">|</span>
            <Link to="/">Trang chủ</Link>
            <span className="news-detail-sep">/</span>
            <Link to={backNewsUrl}>Tin tức</Link>
          </div>
        </nav>
        <div className="news-detail-container" style={{ padding: "60px 16px", textAlign: "center" }}>
          <h1 style={{ fontSize: 26, color: "#0f172a", marginBottom: 12 }}>
            Không tìm thấy bài viết
          </h1>
          <p style={{ color: "#64748b", marginBottom: 28, fontSize: 15 }}>
            Bài viết có thể đã được gỡ bỏ hoặc đường dẫn không còn chính xác.
          </p>
          <button type="button" onClick={handleGoBack} className="news-cta-btn">
            Quay lại trang tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-detail-page">
      <Seo
        title={article.title}
        description={article.excerpt || article.title}
        image={article.thumbnail || undefined}
        path={`/tin-tuc/${article.slug || slug}`}
      />

      {/* --- Breadcrumb & Nút Quay lại Trang Trước --- */}
      <nav className="news-detail-breadcrumb" aria-label="breadcrumb">
        <div className="news-detail-breadcrumb-inner">
          <button
            type="button"
            className="news-breadcrumb-back-btn"
            onClick={handleGoBack}
            title="Quay lại đúng trang danh sách bạn đang xem"
          >
            <ArrowLeftOutlined /> Quay lại
          </button>
          <span className="news-detail-sep">|</span>
          <Link to="/">Trang chủ</Link>
          <span className="news-detail-sep">/</span>
          <Link to={backNewsUrl}>
            Tin tức {savedPage > 1 ? `(Trang ${savedPage})` : ""}
          </Link>
          {article.category && (
            <>
              <span className="news-detail-sep">/</span>
              <span className="news-detail-cat-link">{article.category}</span>
            </>
          )}
          <span className="news-detail-sep">/</span>
          <span className="news-detail-curr" title={article.title}>
            {article.title}
          </span>
        </div>
      </nav>

      {/* --- Main Content Container --- */}
      <div className="news-detail-container">
        <div className="news-detail-layout">
          {/* Cột Trái: Toàn bộ Bài Viết Chính */}
          <article className="news-article-main">
            {/* Header bài viết */}
            <header className="news-article-header">
              <span className="news-article-cat">{article.category}</span>
              <h1 className="news-article-title">{article.title}</h1>

              <div className="news-article-meta">
                <div className="news-meta-left">
                  <span className="news-meta-author">
                    <UserOutlined style={{ marginRight: 4, color: "#b91c1c" }} />
                    {article.author}
                  </span>
                  {article.date && (
                    <>
                      <span className="news-meta-sep">•</span>
                      <span className="news-meta-date">
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {article.date}
                      </span>
                    </>
                  )}
                </div>

                <div className="news-meta-actions">
                  <button
                    type="button"
                    className={`news-action-btn ${copied ? "is-copied" : ""}`}
                    onClick={handleCopyLink}
                    title="Sao chép liên kết"
                  >
                    {copied ? <CheckOutlined /> : <ShareAltOutlined />}
                    <span>{copied ? "Đã chép!" : "Chia sẻ"}</span>
                  </button>
                  <button
                    type="button"
                    className="news-action-btn"
                    onClick={() => window.print()}
                    title="In bài viết"
                  >
                    <PrinterOutlined />
                    <span>In</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Đoạn trích dẫn mở đầu (Sapo) */}
            {article.excerpt && (
              <div className="news-article-sapo news-article-excerpt">
                <p>{article.excerpt}</p>
              </div>
            )}

            {/* Nội dung bài viết từ backend HTML */}
            <ArticleContent html={article.contentHtml} />

            {/* Tags / Chủ đề liên quan */}
            {article.tags?.length > 0 && (
              <div className="news-article-tags-wrap">
                <div className="news-tag-label">
                  <TagOutlined style={{ color: "#b91c1c" }} />
                  <span>Chủ đề liên quan:</span>
                </div>
                <div className="news-tags-list">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tin-tuc?search=${encodeURIComponent(tag)}`}
                      className="news-tag-pill"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Thanh chia sẻ mạng xã hội cuối bài */}
            <div className="news-share-bar">
              <span className="news-share-title">
                <ShareAltOutlined style={{ color: "#b91c1c" }} />
                Chia sẻ bài viết này:
              </span>
              <div className="news-share-buttons">
                <button
                  type="button"
                  className={`news-share-btn news-share-copy ${copied ? "is-copied" : ""}`}
                  onClick={handleCopyLink}
                  title="Sao chép link bài viết"
                >
                  {copied ? <CheckOutlined /> : <CopyOutlined />}
                  <span>{copied ? "Đã chép link!" : "Sao chép link"}</span>
                </button>
                <button
                  type="button"
                  className="news-share-btn news-share-fb"
                  onClick={handleShareFacebook}
                  title="Chia sẻ lên Facebook"
                >
                  <FacebookOutlined />
                  <span>Facebook</span>
                </button>
                <button
                  type="button"
                  className="news-share-btn news-share-zalo"
                  onClick={handleShareZalo}
                  title="Chia sẻ qua Zalo"
                >
                  <span className="news-zalo-badge">Z</span>
                  <span>Zalo</span>
                </button>
                <button
                  type="button"
                  className="news-share-btn news-share-print"
                  onClick={() => window.print()}
                  title="In trang này"
                >
                  <PrinterOutlined />
                  <span>In bài</span>
                </button>
              </div>
            </div>

            {/* Box Tác giả & Cam kết chất lượng kỹ thuật */}
            <div className="news-author-card">
              <div className="news-author-avatar">
                <SafetyCertificateOutlined />
              </div>
              <div className="news-author-info">
                <div className="news-author-badge">Đơn vị biên soạn & Kiểm duyệt chuyên ngành</div>
                <h4 className="news-author-name">{article.author}</h4>
                <p className="news-author-desc">
                  Đội ngũ chuyên gia kỹ sư Công Ty TNHH Thành Công Việt Nam chuyên tư vấn giải pháp còi hú báo động cỡ lớn, hệ thống cảnh báo xả lũ, trạm truyền thanh thông minh và thiết bị PCCC chuyên dụng đạt chuẩn kiểm định. Mọi hỗ trợ kỹ thuật hoặc yêu cầu tài liệu xin liên hệ hotline:{" "}
                  <a href="tel:0865130088">0865.130.088</a>.
                </p>
              </div>
            </div>

            {/* Khung CTA Kêu gọi tư vấn báo giá ngay dưới bài */}
            <div className="news-article-cta-box">
              <div className="news-cta-content">
                <span className="news-cta-badge">TƯ VẤN KỸ THUẬT & DỰ TOÁN</span>
                <h3 className="news-cta-title">Cần Tư Vấn Giải Pháp Phù Hợp Cho Dự Án Của Bạn?</h3>
                <p className="news-cta-desc">
                  Liên hệ kỹ sư Thành Công Việt Nam để nhận sơ đồ nguyên lý lắp đặt, hồ sơ CO/CQ chính hãng và bảng dự toán chiết khấu cao cho nhà thầu & chủ đầu tư.
                </p>
                <div className="news-cta-hotline-wrap">
                  <div className="news-cta-hotline-icon">
                    <PhoneOutlined />
                  </div>
                  <div>
                    <span className="news-cta-hotline-label">Hotline tư vấn kỹ thuật (24/7):</span>
                    <a href="tel:0865130088" className="news-cta-hotline-num">
                      0865.130.088
                    </a>
                  </div>
                </div>
              </div>
              <div className="news-cta-action">
                <Link to="/lien-he" className="news-cta-btn">
                  Yêu cầu báo giá ngay →
                </Link>
                <span className="news-cta-note">Khảo sát & tư vấn miễn phí toàn quốc</span>
              </div>
            </div>

            {/* Nút quay lại danh sách tin tức */}
            <div className="news-back-to-list-wrap">
              <button
                type="button"
                className="news-back-to-list-btn"
                onClick={handleGoBack}
              >
                <ArrowLeftOutlined /> Quay lại danh sách tin tức {savedPage > 1 ? `(Trang ${savedPage})` : ""}
              </button>
            </div>

            {/* Điều hướng Bài trước / Bài tiếp theo */}
            {(prevPost || nextPost) && (
              <div className="news-post-nav">
                {prevPost ? (
                  <Link
                    to={`/tin-tuc/${prevPost.slug}`}
                    className="news-nav-card news-nav-prev"
                    title={prevPost.title}
                  >
                    <span className="news-nav-direction">
                      <ArrowLeftOutlined /> Bài viết trước
                    </span>
                    <span className="news-nav-title">{prevPost.title}</span>
                  </Link>
                ) : (
                  <div className="news-nav-card news-nav-empty" />
                )}

                {nextPost ? (
                  <Link
                    to={`/tin-tuc/${nextPost.slug}`}
                    className="news-nav-card news-nav-next"
                    title={nextPost.title}
                  >
                    <span className="news-nav-direction">
                      Bài viết tiếp theo <ArrowRightOutlined />
                    </span>
                    <span className="news-nav-title">{nextPost.title}</span>
                  </Link>
                ) : (
                  <div className="news-nav-card news-nav-empty" />
                )}
              </div>
            )}
          </article>

          {/* Cột Phải: Sidebar Bài Viết & Hỗ Trợ */}
          <aside className="news-article-sidebar">
            {related.length > 0 && (
              <div className="news-sidebar-widget">
                <h3 className="news-widget-title">Bài Viết Mới Nhất</h3>
                <div className="news-sidebar-list">
                  {related.slice(0, 5).map((item) => (
                    <Link
                      key={item.slug}
                      to={`/tin-tuc/${item.slug}`}
                      className="news-sidebar-item"
                    >
                      {item.image && (
                        <div className="news-sidebar-thumb">
                          <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className="news-sidebar-meta">
                        {item.date && (
                          <span className="news-sidebar-date">{item.date}</span>
                        )}
                        <h4>{item.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="news-sidebar-banner">
              <span className="news-banner-badge">HỖ TRỢ 24/7</span>
              <h4>Đại Lý Ủy Quyền Lion King Tại Việt Nam</h4>
              <p>
                Đầy đủ CO/CQ, bảo hành chính hãng, tư vấn hồ sơ thầu & tiêu chuẩn PCCC công trình.
              </p>
              <a href="tel:0865130088" className="news-banner-btn">
                <PhoneOutlined style={{ marginRight: 6 }} />
                Gọi 0865.130.088
              </a>
            </div>
          </aside>
        </div>

        {/* Section Tin Tức Liên Quan ở Dưới Cùng */}
        {related.length > 0 && (
          <section className="news-related-section">
            <div className="news-related-header">
              <h3>Tin Tức & Kiến Thức Liên Quan</h3>
              <Link to={backNewsUrl} className="news-related-all">
                Xem tất cả tin tức →
              </Link>
            </div>
            <div className="news-related-grid">
              {related.slice(0, 3).map((item) => (
                <Link
                  key={item.slug}
                  to={`/tin-tuc/${item.slug}`}
                  className="news-related-card"
                >
                  {item.image && (
                    <div className="news-related-img">
                      <img src={item.image} alt={item.title} loading="lazy" decoding="async" />
                    </div>
                  )}
                  <div className="news-related-body">
                    <div className="news-related-meta">
                      <span className="news-related-cat">{item.category}</span>
                      {item.date && (
                        <span className="news-related-date">
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {item.date}
                        </span>
                      )}
                    </div>
                    <h4>{item.title}</h4>
                    <span className="news-related-read">Đọc tiếp →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default NewsDetailPage;
