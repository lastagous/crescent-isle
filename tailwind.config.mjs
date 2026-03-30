/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Crescent Isle カラーパレット
        night:    { DEFAULT: '#0a0f1e', 50: '#0d1425', 100: '#111828', 200: '#1a2540', 300: '#243254' },
        moon:     { DEFAULT: '#c8d8f0', light: '#e2ecff', dim: '#8aa8d0' },
        teal:     { DEFAULT: '#2dd4bf', dark: '#0d9488', glow: '#5eead4' },
        gold:     { DEFAULT: '#fbbf24', dim: '#d97706', pale: '#fde68a' },
        crimson:  { DEFAULT: '#f43f5e', dark: '#9f1239' },
        slate:    { DEFAULT: '#94a3b8', light: '#cbd5e1' },
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        body:    ['"Noto Sans JP"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'starfield': "radial-gradient(ellipse at 20% 50%, #1a2540 0%, #0a0f1e 60%)",
        'ocean-depth': "linear-gradient(180deg, #0a0f1e 0%, #0d2440 50%, #0a1a30 100%)",
        'moonlight': "radial-gradient(ellipse 80% 40% at 50% 0%, #1e3a5f33 0%, transparent 70%)",
      },
      boxShadow: {
        'teal-glow': '0 0 20px rgba(45, 212, 191, 0.3)',
        'gold-glow': '0 0 20px rgba(251, 191, 36, 0.25)',
        'moon-glow': '0 0 40px rgba(200, 216, 240, 0.15)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'float':   'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
