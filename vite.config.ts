import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    headers: {
      // Firebase Google sign-in popup needs this — without it COOP blocks window.close
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
});
