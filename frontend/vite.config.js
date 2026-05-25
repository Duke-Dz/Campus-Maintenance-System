import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootDir = fileURLToPath(new URL(".", import.meta.url));
  const env = loadEnv(mode, rootDir, "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            charts: ["recharts"],
            pdf: ["jspdf", "jspdf-autotable"],
            motion: ["framer-motion", "@paper-design/shaders-react"],
            ui: ["@radix-ui/react-separator", "@radix-ui/react-slot", "lucide-react"],
          },
        },
      },
    },
    server: {
      host: env.VITE_DEV_HOST || '0.0.0.0',
      port: Number(env.VITE_DEV_PORT || 5173),
      proxy: {
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Avoid backend CORS rejections when the browser hits the Vite dev
              // server from 127.0.0.1/localhost and the backend only allows a
              // different local origin set. The browser is same-origin to Vite,
              // so forwarding Origin is unnecessary here.
              proxyReq.removeHeader('origin');
            });
          },
        },
      },
    },
  }
})
