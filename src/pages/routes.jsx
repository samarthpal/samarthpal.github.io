import Demo from './demo'
import * as Layouts from 'layouts'

const routes = [
  {
    path: '/demo',
    Component: Demo,
    Super: Layouts.Home,
    auth: false
  }
]

export default routes
