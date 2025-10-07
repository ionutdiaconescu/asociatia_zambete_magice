import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true, // Forțează portul exact, nu permite schimbarea
    hmr: {
      port: 5173,
      overlay: false,
    },
  },
});
