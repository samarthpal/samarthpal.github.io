import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'
import About from './about'
import Resume from './resume'
import Skills from './skills'
import Portfolio from './portfolio'
import Contact from './contact'
import { ScrollToTop } from 'components'

export default function Main() {
  useEffect(() => {
    head({ title: 'Samarth Pal - Home' })
  }, [])

  useEffect(() => {
    // const path = window.location.hash.substring(2)
    const path = window.location.pathname.substring(1)
    if (path === 'home') {
      head({ title: `Samarth Pal - ${path.charAt(0).toUpperCase() + path.substring(1)}` })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.getElementById(path)
      if (el) {
        head({ title: `Samarth Pal - ${path.charAt(0).toUpperCase() + path.substring(1)}` })
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  // useEffect(() => {
  //   window.particlesJS('particles-js', {
  //     particles: {
  //       number: {
  //         value: 200,
  //         density: {
  //           enable: true,
  //           value_area: 10000
  //         }
  //       },
  //       color: {
  //         value: '#ffffff'
  //       },
  //       shape: {
  //         type: 'circle',
  //         stroke: {
  //           width: 0,
  //           color: '#000000'
  //         },
  //         polygon: {
  //           nb_sides: 5
  //         },
  //         image: {
  //           src: 'img/github.svg',
  //           width: 100,
  //           height: 100
  //         }
  //       },
  //       opacity: {
  //         value: 0.5,
  //         random: false,
  //         anim: {
  //           enable: false,
  //           speed: 1,
  //           opacity_min: 0.1,
  //           sync: false
  //         }
  //       },
  //       size: {
  //         value: 3,
  //         random: true,
  //         anim: {
  //           enable: false,
  //           speed: 40,
  //           size_min: 0.1,
  //           sync: false
  //         }
  //       },
  //       line_linked: {
  //         enable: true,
  //         distance: 150,
  //         color: '#ffffff',
  //         opacity: 0.4,
  //         width: 1
  //       },
  //       move: {
  //         enable: true,
  //         speed: 6,
  //         direction: 'none',
  //         random: false,
  //         straight: false,
  //         out_mode: 'out',
  //         bounce: false,
  //         attract: {
  //           enable: false,
  //           rotateX: 600,
  //           rotateY: 1200
  //         }
  //       }
  //     },
  //     interactivity: {
  //       detect_on: 'canvas',
  //       events: {
  //         onhover: {
  //           enable: true,
  //           mode: 'grab'
  //         },
  //         onclick: {
  //           enable: true,
  //           mode: 'push'
  //         },
  //         resize: true
  //       },
  //       modes: {
  //         grab: {
  //           distance: 140,
  //           line_linked: {
  //             opacity: 1
  //           }
  //         },
  //         bubble: {
  //           distance: 400,
  //           size: 40,
  //           duration: 2,
  //           opacity: 8,
  //           speed: 3
  //         },
  //         repulse: {
  //           distance: 200,
  //           duration: 0.4
  //         },
  //         push: {
  //           particles_nb: 4
  //         },
  //         remove: {
  //           particles_nb: 2
  //         }
  //       }
  //     },
  //     retina_detect: true
  //   })
  // }, [])

  return (
    <div className={s.main} id='home'>
      <div className={s.outer}>
        <div className={s.content + ' innerScrollX '}>
          <About />
          <Resume />
          <Skills />
          <Portfolio />
          <Contact />
        </div>
      </div>
      {/* <div id='particles-js'></div> */}
      <ScrollToTop />
    </div>
  )
}
