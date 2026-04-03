import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lastagous.com',
  base: '',
  output: 'static',
  integrations: [
    svelte(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
  build: {
    assets: '_assets',
  },
});
