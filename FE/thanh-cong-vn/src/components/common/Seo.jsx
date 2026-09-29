import { useEffect } from "react";

const SITE_NAME = "Thành Công Việt Nam";
const DEFAULT_DESCRIPTION =
  "Công ty TNHH Thành Công Việt Nam — đại lý ủy quyền Lion King. Còi hú báo động công suất lớn, thiết bị PCCC, tủ điều khiển GSM/4G. Hotline 0865.130.088";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Cập nhật title + meta description / OG cho từng trang (SPA).
 */
export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = "https://cdn0344.cdn4s.com/media/logo/cropped-logo-coihubaodong-2.png",
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:locale", "vi_VN");
    upsertMeta("property", "og:image", image);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);

    const origin = window.location.origin;
    const canonicalHref = `${origin}${path || window.location.pathname}`;
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalHref);
  }, [title, description, path, image, noindex]);

  return null;
}

export { SITE_NAME, DEFAULT_DESCRIPTION };
