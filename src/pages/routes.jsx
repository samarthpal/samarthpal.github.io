import Home from './home'

import * as Layouts from 'layouts'

const routes = [
  {
    path: '/home',
    Component: Home,
    Super: Layouts.Home,
    auth: false
  },
  {
    path: '/about',
    Component: Home,
    Super: Layouts.Home,
    auth: false
  },
  {
    path: '/resume',
    Component: Home,
    Super: Layouts.Home,
    auth: false
  },
  {
    path: '/skills',
    Component: Home,
    Super: Layouts.Home,
    auth: false
  },
  {
    path: '/portfolio',
    Component: Home,
    Super: Layouts.Home,
    auth: false
  },
  {
    path: '/contact',
    Component: Home,
    Super: Layouts.Home,
    auth: false
  }
]

export default routes
