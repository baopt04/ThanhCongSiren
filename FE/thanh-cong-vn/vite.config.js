import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: "gzip", ext: ".gz", threshold: 10240 }),
    viteCompression({ algorithm: "brotliCompress", ext: ".br", threshold: 10240 }),
  ],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("react-router")) {
            return "react-vendor";
          }
          if (id.includes("@tiptap") || id.includes("prosemirror")) {
            return "tiptap-vendor";
          }
          if (id.includes("antd") || id.includes("@ant-design") || id.includes("rc-")) {
            return "antd-vendor";
          }
          if (id.includes("axios")) {
            return "axios-vendor";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
