import { defineConfig } from 'astro/config';

// Сайт «Цветные кладочные смеси» (ООО «Кирпичный трест»). Пока боевого домена нет —
// закрыт от поиска на уровне хостинга (vercel.json) и страниц (noindex).
export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  compressHTML: true,
});
