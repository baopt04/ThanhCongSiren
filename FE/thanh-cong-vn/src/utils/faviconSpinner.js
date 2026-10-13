/**
 * Favicon Loading Spinner Utility
 * Hiệu ứng xoay tròn logo trên tab trình duyệt (Browser Tab) khi chuyển trang / chuyển tab / xem chi tiết.
 * Mô phỏng spinner tab trình duyệt: Vòng tròn màu xanh nhạt (#8ab4f8) quay quanh logo sư tử đỏ.
 */

let animationFrameId = null;
let stopTimer = null;
let originalFaviconHref = "/favicon.png";
let logoImage = null;
let isImageLoaded = false;

// Khởi tạo và preload ảnh favicon
function initLogoImage() {
  if (typeof window === "undefined") return;
  if (logoImage) return;

  const currentIcon = document.querySelector("link[rel*='icon']");
  if (currentIcon && currentIcon.href) {
    originalFaviconHref = currentIcon.getAttribute("href") || "/favicon.png";
  }

  logoImage = new Image();
  logoImage.crossOrigin = "anonymous";
  logoImage.src = "/favicon.png";
  logoImage.onload = () => {
    isImageLoaded = true;
  };
  logoImage.onerror = () => {
    // Fallback sang /logo.png nếu /favicon.png lỗi
    logoImage.src = "/logo.png";
  };
}

// Khởi chạy preload ngay khi file được import
if (typeof window !== "undefined") {
  initLogoImage();
}

/**
 * Kích hoạt hiệu ứng xoay tròn trên tab trình duyệt
 * @param {number} duration - Thời gian xoay (mặc định 350ms)
 */
export function startFaviconSpinner(duration = 350) {
  if (typeof window === "undefined") return;

  initLogoImage();

  // Xóa timer dừng cũ nếu có
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }

  // Dừng animation cũ nếu đang chạy
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let angle = 0;
  const arcLength = 1.35 * Math.PI; // Vòng cung khoảng 245 độ
  const radius = 27;
  const center = 32;

  let lastUpdate = 0;
  function renderFrame(timestamp) {
    if (!lastUpdate || timestamp - lastUpdate >= 32) {
      lastUpdate = timestamp;
      ctx.clearRect(0, 0, 64, 64);

      // 1. Vẽ cung tròn loading spinner xoay bên ngoài (màu xanh nhạt như tab Chrome: #8ab4f8)
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, angle, angle + arcLength, false);
      ctx.strokeStyle = "#8ab4f8";
      ctx.lineWidth = 5.5;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      // 2. Vẽ logo sư tử đỏ ở chính giữa vòng tròn
      if (logoImage && (isImageLoaded || logoImage.complete)) {
        ctx.save();
        // Kích thước logo 34x34px đặt chính giữa canvas 64x64px
        ctx.drawImage(logoImage, 15, 15, 34, 34);
        ctx.restore();
      }

      // 3. Cập nhật thẻ <link rel="icon">
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/png";
        document.head.appendChild(link);
      }
      link.href = canvas.toDataURL("image/png");

      angle = (angle + 0.32) % (2 * Math.PI);
    }
    animationFrameId = requestAnimationFrame(renderFrame);
  }

  // Bắt đầu vòng lặp xoay
  animationFrameId = requestAnimationFrame(renderFrame);

  // Tự động dừng sau `duration` (vài trăm ms)
  stopTimer = setTimeout(() => {
    stopFaviconSpinner();
  }, duration);
}

/**
 * Dừng xoay và khôi phục logo tĩnh trên tab
 */
export function stopFaviconSpinner() {
  if (typeof window === "undefined") return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }

  const link = document.querySelector("link[rel*='icon']");
  if (link) {
    link.href = originalFaviconHref || "/favicon.png";
  }
}
