// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Single-repo architecture: this repository (weewzr/weewzr) is both the GitHub profile
// README repository and the source of the site served at https://weewzr.github.io/weewzr/.
// To move to a root URL later: create weewzr/weewzr.github.io, set base to '/' and
// leave `site` unchanged.
export default defineConfig({
  site: 'https://weewzr.github.io',
  base: '/weewzr',
  trailingSlash: 'always',
  // Parallel agents and CI can override these so concurrent builds do not collide.
  outDir: process.env.ASTRO_OUT_DIR ?? './dist',
  cacheDir: process.env.ASTRO_CACHE_DIR ?? './node_modules/.astro',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
