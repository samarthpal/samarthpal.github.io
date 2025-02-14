import { Link, useNavigate } from 'react-router-dom'
import images from 'images'
import s from './styles.module.scss'
import { useEffect, useState } from 'react'
import { head } from 'helpers'

export default function Main({ fullscreen, setFullscreen }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div id='nav' className={isScrolled ? s.outerNav + ' ' + s.outerNavScrolled : s.outerNav}>
      <nav className={isScrolled ? s.nav + ' ' + s.scrolled : s.nav}>
        <div className={s.left}>
          <Link to='/home'>
            <img src={images.logoAltWhite} alt='' />
          </Link>
        </div>

        <div className={s.right}>
          <NavLinks onClickHandler={() => setFullscreen(false)} />
        </div>

        <div className={s.hamburger + ' material-icons'} onClick={() => setFullscreen(true)}>
          menu
        </div>
      </nav>

      {!!fullscreen && (
        <div className={s.fullscreenMenu}>
          <div className={s.close + ' material-icons'} onClick={() => setFullscreen(false)}>
            close
          </div>
          <NavLinks onClickHandler={() => setFullscreen(false)} />
        </div>
      )}
    </div>
  )
}

const NavLinks = props => {
  const navigate = useNavigate()
  // const currPath = window.location.pathname
  const currPath = window.location.hash.substring(1)

  const handleClick = (path, name) => {
    navigate(path)
    if (path === '/home') {
      head({ title: `Samarth Pal - Home` })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.getElementById(path.substring(1))
      if (el) {
        head({ title: `Samarth Pal - ${name}` })
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className={s.navLinks}>
      {navLinks.map(({ name, path }, i) => (
        <div
          key={i}
          className={currPath.startsWith(path) ? s.active : ''}
          onClick={() => {
            props.onClickHandler()
            handleClick(path, name)
          }}
        >
          <div>{name}</div>
        </div>
      ))}
    </div>
  )
}

const navLinks = [
  {
    name: 'Home',
    path: '/home'
  },
  {
    name: 'About',
    path: '/about'
  },
  {
    name: 'Resume',
    path: '/resume'
  },
  {
    name: 'Skills',
    path: '/skills'
  },
  {
    name: 'Portfolio',
    path: '/portfolio'
  },
  {
    name: 'Contact',
    path: '/contact'
  }
]
