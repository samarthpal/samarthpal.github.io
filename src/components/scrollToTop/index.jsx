import { useEffect, useState } from 'react'
import s from './styles.module.scss'
import { useNavigate } from 'react-router-dom'

export default function Main() {
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false)
  const navigate = useNavigate()

  const handleScroll = () => {
    setIsScrollToTopVisible(window.scrollY > 0)
  }

  const scrollToTop = () => {
    navigate('/home')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    !!isScrollToTopVisible && (
      <div className={s.main}>
        <div className={s.topScroll} onClick={scrollToTop}>
          <span className='material-icons-outlined'>expand_less</span>
        </div>
      </div>
    )
  )
}
