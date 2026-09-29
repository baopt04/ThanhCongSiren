import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { getAllPostsForCustomer } from "../../services/customer/CustomerPostService";
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

export function NewsDetailPage() {
  const { slug } = useParams();
  const [copied, setCopied] = useState(false);
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await getAllPostsForCustomer();
        const rawList =
          res?.data?.content ||
          res?.data ||
          res?.content ||
          (Array.isArray(res) ? res : []);
        const list = Array.isArray(rawList) ? rawList : [];
        const found = list.find(
          (item) => item.slug === slug || String(item.id) === String(slug)
        );

        if (!isMounted) return;

        if (found) {
          setArticle(mapPost(found));
          setRelated(
            list
              .filter((item) => item.slug !== found.slug && item.id !== found.id)
              .slice(0, 4)
              .map((item) => ({
                slug: item.slug || item.id,
                title: item.title,
                date: formatPubDate(item.publishedAt),
                image: item.thumbnailUrl || "",
              }))
          );
        } else {
          setArticle(null);
          setNotFound(true);
          setRelated(
            list.slice(0, 4).map((item) => ({
              slug: item.slug || item.id,
              title: item.title,
              date: formatPubDate(item.publishedAt),
              image: item.thumbnailUrl || "",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching article detail:", err);
        if (isMounted) {
          setNotFound(true);
          setArticle(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="news-detail-page" style={{ padding: "80px 0", textAlign: "center" }}>
        <LoadingOutlined spin style={{ fontSize: 36, color: "#b91c1c" }} />
        <p style={{ marginTop: 12, color: "#64748b" }}>Đang tải bài viết...</p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="news-detail-page">
        <Seo title="Không tìm thấy bài viết" noindex />
        <nav className="news-detail-breadcrumb" aria-label="breadcrumb">
          <div className="news-detail-breadcrumb-inner">
            <Link to="/">Trang chủ</Link>
            <span className="news-detail-sep">/</span>
            <Link to="/tin-tuc">Tin tức</Link>
          </div>
        </nav>
        <div className="news-detail-container" style={{ padding: "48px 16px", textAlign: "center" }}>
          <h1>Không tìm thấy bài viết</h1>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            Bài viết có thể đã bị xóa hoặc đường dẫn không còn hợp lệ.
          </p>
          <Link to="/tin-tuc" className="news-cta-btn">
            Quay lại danh sách tin tức
          </Link>
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

      <nav className="news-detail-breadcrumb" aria-label="breadcrumb">
        <div className="news-detail-breadcrumb-inner">
          <Link to="/">Trang chủ</Link>
          <span className="news-detail-sep">/</span>
          <Link to="/tin-tuc">Tin tức</Link>
          <span className="news-detail-sep">/</span>
          <span className="news-detail-curr">{article.title}</span>
        </div>
      </nav>

      <div className="news-detail-container">
        <div className="news-detail-layout">
          <article className="news-article-main">
            <header className="news-article-header">
              <span className="news-article-cat">{article.category}</span>
              <h1 className="news-article-title">{article.title}</h1>

              <div className="news-article-meta">
                <div className="news-meta-left">
                  <span className="news-meta-author">{article.author}</span>
                  {article.date && (
                    <>
                      <span className="news-meta-sep">•</span>
                      <span className="news-meta-date">{article.date}</span>
                    </>
                  )}
                </div>

                <div className="news-meta-actions">
                  <button type="button" className="news-action-btn" onClick={handleCopyLink}>
                    {copied ? "Đã chép!" : "Chia sẻ"}
                  </button>
                  <button type="button" className="news-action-btn" onClick={() => window.print()}>
                    In
                  </button>
                </div>
              </div>
            </header>

            {article.excerpt && (
              <div className="news-article-excerpt">
                <p>{article.excerpt}</p>
              </div>
            )}

            {article.thumbnail && (
              <div className="news-article-featured-img">
                <img src={article.thumbnail} alt={article.title} />
              </div>
            )}

            <div
              className="news-article-body"
              dangerouslySetInnerHTML={{
                __html: embedYoutubeInHtml(article.contentHtml),
              }}
            />

            {article.tags?.length > 0 && (
              <div className="news-article-tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="news-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="news-article-cta-box">
              <div className="news-cta-text">
                <h3>Cần Tư Vấn Giải Pháp Phù Hợp Cho Dự Án Của Bạn?</h3>
                <p>
                  Liên hệ kỹ sư Thành Công Việt Nam để nhận bản vẽ nguyên lý và dự toán chiết khấu.
                </p>
                <div className="news-cta-phone">
                  <span>Hotline kỹ thuật:</span>
                  <a href="tel:0865130088">0865.130.088</a>
                </div>
              </div>
              <div className="news-cta-btn-wrap">
                <Link to="/lien-he" className="news-cta-btn">
                  Yêu cầu báo giá ngay
                </Link>
              </div>
            </div>
          </article>

          <aside className="news-article-sidebar">
            {related.length > 0 && (
              <div className="news-sidebar-widget">
                <h3 className="news-widget-title">Bài Viết Mới Nhất</h3>
                <div className="news-sidebar-list">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/tin-tuc/${item.slug}`}
                      className="news-sidebar-item"
                    >
                      {item.image && (
                        <div className="news-sidebar-thumb">
                          <img src={item.image} alt={item.title} loading="lazy" />
                        </div>
                      )}
                      <div className="news-sidebar-meta">
                        {item.date && <span className="news-sidebar-date">{item.date}</span>}
                        <h4>{item.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="news-sidebar-banner">
              <div className="news-banner-inner">
                <span className="news-banner-badge">HỖ TRỢ 24/7</span>
                <h4>Đại Lý Ủy Quyền Lion King Tại Việt Nam</h4>
                <p>Đầy đủ CO/CQ, bảo hành chính hãng, hỗ trợ hồ sơ thầu công trình.</p>
                <a href="tel:0865130088" className="news-banner-btn">
                  Gọi 0865.130.088
                </a>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="news-related-section">
            <div className="news-related-header">
              <h3>Tin Tức & Kiến Thức Liên Quan</h3>
              <Link to="/tin-tuc" className="news-related-all">
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
                      <img src={item.image} alt={item.title} loading="lazy" />
                    </div>
                  )}
                  <div className="news-related-body">
                    {item.date && <span className="news-related-date">{item.date}</span>}
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
