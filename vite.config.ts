import { defineConfig } from "vite";
import logseqDevPlugin from "vite-plugin-logseq";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svelte(),
    logseqDevPlugin()
  ],
  // Makes HMR available for development
  build: {
    target: "esnext",
    minify: "esbuild",
  },
});

