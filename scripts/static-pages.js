/**
 * Vite build plugin: makes every route a real, indexable page on GitHub Pages.
 *
 * GitHub Pages has no server rewrites. The usual SPA trick (a 404.html that redirects)
 * serves deep links with HTTP 404, which Google refuses to index. Instead, after the build
 * this writes one HTML file per route (build/work/<slug>/index.html, build/playground/…),
 * each served with 200 and carrying its own title, description, canonical and og:* tags.
 * React (BrowserRouter) then takes over in the browser as usual.
 *
 * Also writes:
 *  - build/404.html: the same app shell (React shows the 404 page), marked noindex
 *  - build/sitemap.xml: every route, generated from the same list
 *
 * Routes come from src/data/profile.json, so a new case study is picked up automatically.
 */
import fs from 'node:fs'
import path from 'node:path'

export const SITE = 'https://samarthpal.github.io'

const esc = value =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Every indexable route, with the meta it should ship. Keep in sync with src/pages/routes.jsx. */
export function pagesFrom(profile) {
  return [
    { route: '/', priority: '1.0' }, // keeps index.html's own meta
    {
      route: '/playground/',
      priority: '0.5',
      title: `Lab — ${profile.shortName}`,
      description: `ASCII Studio, Bug Squash and a portfolio terminal: small toys by ${profile.shortName}.`
    },
    ...profile.work.map(w => ({
      route: `/work/${w.slug}/`,
      priority: '0.8',
      title: `${w.name} — ${profile.shortName}`,
      description: `${w.summary} A ${w.company} case study.`
    }))
  ]
}

const replaceAttr = (html, pattern, value) => html.replace(pattern, (_, before, after) => before + esc(value) + after)

/** Rewrites the page-specific tags of the built index.html. */
function withMeta(html, { url, title, description }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  out = replaceAttr(out, /(<meta\s+name="title"\s+content=")[^"]*(")/, title)
  out = replaceAttr(out, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, title)
  out = replaceAttr(out, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, title)
  out = replaceAttr(out, /(<meta\s+name="description"\s+content=")[^"]*(")/, description)
  out = replaceAttr(out, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, description)
  out = replaceAttr(out, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, description)
  out = replaceAttr(out, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, url)
  out = replaceAttr(out, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, url)
  return out
}

function sitemap(pages) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = pages
    .map(p => `  <url>\n    <loc>${SITE}${p.route}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/**
 * @param {{ outDir: string, profilePath: string }} options
 */
export default function staticPages({ outDir, profilePath }) {
  return {
    name: 'static-pages',
    apply: 'build',
    closeBundle() {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'))
      const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const pages = pagesFrom(profile)

      for (const page of pages) {
        if (page.route === '/') continue
        const dir = path.join(outDir, page.route)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), withMeta(shell, { ...page, url: SITE + page.route }))
      }

      // Unknown URLs: GitHub Pages serves 404.html (status 404). Same app → React shows the 404 page.
      fs.writeFileSync(
        path.join(outDir, '404.html'),
        shell.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/>/, '<meta name="robots" content="noindex" />')
      )

      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap(pages))
      console.log(`static-pages: wrote ${pages.length - 1} route pages, 404.html and sitemap.xml (${pages.length} urls)`)
    }
  }
}
