import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from 'layouts/main'
import routes from './routes'

// Clean URLs (/work/stashblog). GitHub Pages has no rewrites, so the build writes a real HTML
// file for every route (scripts/static-pages.js); old /#/… links are rewritten in index.html.
export default function Pages() {
  return (
    <BrowserRouter>
      <Main>
        <Suspense fallback={<div className="route-fallback" aria-busy="true" />}>
          <Routes>
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </Suspense>
      </Main>
    </BrowserRouter>
  )
}
