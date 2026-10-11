import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// The build inlines every script, style and JSON import into one dist/index.html.
// That keeps the property the project was born with: a single file you can email,
// open by double-clicking, and host anywhere, with no remote assets but the fonts.
export default defineConfig({
  root: "src",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 2000
  },
  plugins: [viteSingleFile()]
});
