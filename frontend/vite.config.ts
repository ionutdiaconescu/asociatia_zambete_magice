import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5174,
    host: true,
    strictPort: true, // Forțează portul exact, nu permite schimbarea
    hmr: {
      port: 5174,
      overlay: false,
    },
  },
});
