import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'

export default function Main() {
  useEffect(() => {
    head({ title: 'SAMARTH PAL' })
  }, [])
  return (
    <div className={s.main}>
      <div className={s.contact + ' indent'}>
        <div className='title'>Contact</div>
      </div>
    </div>
  )
}
