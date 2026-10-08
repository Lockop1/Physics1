import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves a project site at https://<user>.github.io/<repo>/,
// so the base path must be the repo name. The deploy workflow sets
// VITE_BASE from the repository name; local dev uses "/".
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [react()],
  base,
});
