import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PixelSprite from 'components/pixelSprite'
import loadPixelFont from 'helpers/pixelFont'
import { BUG_A, SKINS } from 'helpers/sprites'
import useHead from 'hooks/useHead'
import s from './index.module.scss'

export default function NotFound() {
  const navigate = useNavigate()
  useHead({ title: '404' })

  useEffect(() => {
    loadPixelFont()
    const onKey = e => e.key === 'Enter' && e.target === document.body && navigate('/')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <main className={s.page}>
      <div className={s.screen}>
        <PixelSprite rows={BUG_A} colors={SKINS.bug} size={88} className={s.bug} />
        <p className={s.code}>404</p>
        <h1 className={s.title}>LEVEL NOT FOUND</h1>
        <p className={s.text}>A bug ate this page. It happens to the best of us.</p>
        <Link to="/" className={s.start}>
          ▶ PRESS START TO RETURN HOME
        </Link>
      </div>
    </main>
  )
}
