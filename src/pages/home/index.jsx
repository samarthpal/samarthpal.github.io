import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'
import About from './about'
import Resume from './resume'
import Gallery from './gallery'
import Skills from './skills'
import Projects from './projects'
import Contact from './contact'

export default function Main() {
  useEffect(() => {
    head({ title: 'SAMARTH PAL' })
  }, [])
  return (
    <div className={s.main}>
      <div className={s.outer}>
        <div className={s.content + ' innerScrollX '}>
          <About />
          <Resume />
          <Gallery />
          <Skills />
          <Projects />
          <Contact />
        </div>
      </div>
    </div>
  )
}
