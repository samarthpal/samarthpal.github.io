import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import staticPages from './scripts/static-pages.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = dir => path.resolve(__dirname, 'src', dir)
const outDir = path.resolve(__dirname, 'build')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5173

  return {
    // staticPages: one real HTML page per route + 404.html + sitemap.xml (see scripts/static-pages.js)
    plugins: [react(), staticPages({ outDir, profilePath: src('data/profile.json') })],
    base: '/',
    server: { port },
    preview: { port },
    resolve: {
      alias: {
        api: src('api'),
        assets: src('assets'),
        components: src('components'),
        data: src('data'),
        helpers: src('helpers'),
        hooks: src('hooks'),
        images: src('images'),
        layouts: src('layouts'),
        pages: src('pages'),
        styles: src('styles')
      }
    },
    css: {
      postcss: { plugins: [autoprefixer()] },
      preprocessorOptions: {
        scss: { additionalData: `@use "${src('styles/mixins.scss').replace(/\\/g, '/')}" as *;\n` }
      }
    },
    build: {
      outDir,
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-dom/client', 'react-router-dom'],
            motion: ['gsap', 'gsap/ScrollTrigger', '@gsap/react', 'lenis']
          }
        }
      }
    }
  }
})
