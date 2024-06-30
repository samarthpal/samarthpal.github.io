import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'

export default function Main() {
  useEffect(() => {
    head({ title: 'SAMARTH PAL' })
  }, [])
  return (
    <div className={s.main}>
      <div className={s.skills + ' indent'}>
        <div className='title'>Skills</div>
      </div>
    </div>
  )
}
