import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

// GitHub Pages では リポジトリ名をベースパスに設定
// 例: https://username.github.io/crescent-isle-guide/
export default defineConfig({
  site: 'https://lastagous.com',
  base: '',
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
