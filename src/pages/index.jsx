import { Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Main from 'layouts/main'
import routes from './routes'

// HashRouter: GitHub Pages has no server rewrites, so /#/work/x keeps deep links working.
export default function Pages() {
  return (
    <HashRouter>
      <Main>
        <Suspense fallback={<div className="route-fallback" aria-busy="true" />}>
          <Routes>
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </Suspense>
      </Main>
    </HashRouter>
  )
}
