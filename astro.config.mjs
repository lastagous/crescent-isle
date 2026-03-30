import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

// GitHub Pages では リポジトリ名をベースパスに設定
// 例: https://username.github.io/crescent-isle-guide/
const BASE = process.env.CI ? '/crescent-isle' : '';

export default defineConfig({
  site: 'https://lastagous.github.io',
  base: BASE,
  output: 'static',
  integrations: [
    svelte(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  build: {
    assets: '_assets',
  },
});
