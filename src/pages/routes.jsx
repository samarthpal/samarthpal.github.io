import Home from './home'
// import About from './home/about'
// import Resume from './home/resume'
// import Gallery from './home/gallery'
// import Skills from './home/skills'
// import Projects from './home/projects'
// import Contact from './home/contact'

import * as Layouts from 'layouts'

const routes = [
  {
    path: '/home',
    Component: Home,
    Super: Layouts.Home,
    auth: false
  }
  // },
  // {
  //   path: '/about',
  //   Component: About,
  //   Super: Layouts.Home,
  //   auth: false
  // },
  // {
  //   path: '/resume',
  //   Component: Resume,
  //   Super: Layouts.Home,
  //   auth: false
  // },
  // {
  //   path: '/gallery',
  //   Component: Gallery,
  //   Super: Layouts.Home,
  //   auth: false
  // },
  // {
  //   path: '/skills',
  //   Component: Skills,
  //   Super: Layouts.Home,
  //   auth: false
  // },
  // {
  //   path: '/projects',
  //   Component: Projects,
  //   Super: Layouts.Home,
  //   auth: false
  // },
  // {
  //   path: '/contact',
  //   Component: Contact,
  //   Super: Layouts.Home,
  //   auth: false
  // }
]

export default routes
