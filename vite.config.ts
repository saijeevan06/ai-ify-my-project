import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const API_PORT = Number(process.env.PORT ?? 8787);

// Static hosts (Vercel) have no Express to fill %PUBLIC_URL% in the OG tags, so bake it in at build
// time when the URL is known. Otherwise leave the placeholder for server/index.ts.
const buildUrl = process.env.PUBLIC_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    { name: 'public-url', transformIndexHtml: (html) => (buildUrl ? html.replaceAll('%PUBLIC_URL%', buildUrl.replace(/\/$/, '')) : html) },
  ],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': `http://localhost:${API_PORT}` },
  },
});
