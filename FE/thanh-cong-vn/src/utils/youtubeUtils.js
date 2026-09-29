/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://youtu.be/ID (with or without ?si=...)
 * - https://www.youtube.com/watch?v=ID
 * - https://youtube.com/embed/ID
 * - https://youtube.com/shorts/ID
 * - https://m.youtube.com/watch?v=ID
 */
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Generate standard responsive embed HTML for YouTube video
 */
export function createEmbedHtml(videoId) {
  if (!videoId) return "";
  return `<div class="pd-video-embed-wrap"><div class="pd-video-box"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>`;
}

/**
 * Transform HTML content containing YouTube URLs into responsive YouTube video embeds
 * Automatically replaces:
 * - <p><a href="...youtube...">...</a></p>
 * - <a href="...youtube...">...</a>
 * - <p>https://youtu.be/...</p>
 * - Existing YouTube iframes that need responsive wrapper
 */
export function embedYoutubeInHtml(html) {
  if (!html || typeof html !== "string") return html;
  if (!html.includes("youtube.com") && !html.includes("youtu.be")) {
    return html;
  }

  // If running in browser environment with DOMParser available
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // 1. Process <a> tags with YouTube links
      const links = Array.from(doc.querySelectorAll("a"));
      links.forEach((a) => {
        const href = a.getAttribute("href") || "";
        const videoId = getYouTubeVideoId(href) || getYouTubeVideoId(a.textContent.trim());
        if (videoId) {
          const parent = a.parentElement;
          const embedContainer = doc.createElement("div");
          embedContainer.className = "pd-video-embed-wrap";
          embedContainer.innerHTML = `<div class="pd-video-box"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;

          // If parent is paragraph or div containing solely or predominantly this link
          if (
            parent &&
            (parent.tagName === "P" || parent.tagName === "DIV") &&
            (parent.textContent.trim() === a.textContent.trim() || parent.childNodes.length <= 2)
          ) {
            parent.replaceWith(embedContainer);
          } else {
            a.replaceWith(embedContainer);
          }
        }
      });

      // 2. Process <p> or <div> tags containing plain-text YouTube links
      const textNodes = Array.from(doc.querySelectorAll("p, div:not(.pd-video-embed-wrap):not(.pd-video-box)"));
      textNodes.forEach((el) => {
        if (el.querySelector("iframe, .pd-video-embed-wrap")) return;
        const text = el.textContent.trim();
        const videoId = getYouTubeVideoId(text);
        if (
          videoId &&
          (text.startsWith("http://") ||
            text.startsWith("https://") ||
            text.startsWith("youtu.be") ||
            text.startsWith("www.youtube") ||
            text.startsWith("youtube.com"))
        ) {
          const embedContainer = doc.createElement("div");
          embedContainer.className = "pd-video-embed-wrap";
          embedContainer.innerHTML = `<div class="pd-video-box"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
          el.replaceWith(embedContainer);
        }
      });

      // 3. Ensure any existing YouTube iframes (e.g. from TipTap) are wrapped nicely
      const iframes = Array.from(doc.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]'));
      iframes.forEach((iframe) => {
        if (!iframe.closest(".pd-video-box")) {
          const wrapper = doc.createElement("div");
          wrapper.className = "pd-video-embed-wrap";
          const box = doc.createElement("div");
          box.className = "pd-video-box";
          iframe.parentNode.insertBefore(wrapper, iframe);
          box.appendChild(iframe);
          wrapper.appendChild(box);
        }
      });

      return doc.body.innerHTML;
    } catch (err) {
      console.warn("DOMParser error in embedYoutubeInHtml:", err);
    }
  }

  // Regex fallback
  let result = html;
  const pAnchorRegex = /<p[^>]*>\s*<a[^>]+href=["'](?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^"']*["'][^>]*>[\s\S]*?<\/a>\s*<\/p>/gi;
  result = result.replace(pAnchorRegex, (_, videoId) => createEmbedHtml(videoId));

  const pRawRegex = /<p[^>]*>\s*(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*)\s*<\/p>/gi;
  result = result.replace(pRawRegex, (_, videoId) => createEmbedHtml(videoId));

  const standaloneAnchorRegex = /<a[^>]+href=["'](?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[^"']*["'][^>]*>(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)[\s\S]*?<\/a>/gi;
  result = result.replace(standaloneAnchorRegex, (_, videoId) => createEmbedHtml(videoId));

  return result;
}
