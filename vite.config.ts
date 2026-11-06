import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
    proxy: process.env.FIGMA
      ? {
          "/api": {
            target: "https://chemprojectbackend.onrender.com",
            changeOrigin: true,
            secure: true,
          },
        }
      : undefined,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
