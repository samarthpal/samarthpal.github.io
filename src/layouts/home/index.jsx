import NavBar from './navbar'
import s from './styles.module.scss'
import { useState } from 'react'

export default function Main({ children }) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <>
      <div className={s.main}>
        <NavBar fullscreen={fullscreen} setFullscreen={setFullscreen} />
        {!fullscreen && <div className={s.content}>{children}</div>}
      </div>
    </>
  )
}
