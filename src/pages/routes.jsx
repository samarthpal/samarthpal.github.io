import { lazy } from 'react'
import Home from './landing/home'

// Home is eager (it holds the LCP). Everything else is its own chunk.
// Adding an indexable route? Add it to pagesFrom() in scripts/static-pages.js too (sitemap + static page).
const WorkDetail = lazy(() => import('./landing/work'))
const Playground = lazy(() => import('./landing/playground'))
const NotFound = lazy(() => import('./common/notFound'))

const routes = [
  { path: '/', Component: Home },
  { path: '/work/:slug', Component: WorkDetail },
  { path: '/playground', Component: Playground },
  { path: '*', Component: NotFound }
]

export default routes
