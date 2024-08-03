import { Link } from 'react-router-dom'
import s from './styles.module.scss'
import images from 'images'

export default function Main() {
  return (
    <div className={s.main}>
      <div className={s.footer}>
        <div className={s.row}>
          <Link to='/' className={s.logoBox}>
            <img src={images.logoAltWhite} alt='' />
          </Link>
        </div>
        <div className={s.row}>
          <div className={s.cardBackInner}>
            <a href='https://www.facebook.com/samarth.pal.77' target='_blank' rel='noreferrer' className={s.icon}>
              <i className='fa-brands fa-facebook'></i>
            </a>
            <a href='https://www.instagram.com/samarth_pal_02/' target='_blank' rel='noreferrer' className={s.icon}>
              <i className='fa-brands fa-instagram'></i>
            </a>
            <a
              href='https://www.linkedin.com/in/samarth-pal-3335201a0/'
              target='_blank'
              rel='noreferrer'
              className={s.icon}
            >
              <i className='fa-brands fa-linkedin-in'></i>
            </a>
            <a href='https://github.com/samarthpal' target='_blank' rel='noreferrer' className={s.icon}>
              <i className='fa-brands fa-github'></i>
            </a>
            {/* <a href='https://leetcode.com/u/palsamarth02/' target='_blank' className={s.icon}>
              <i className='fa-solid fa-code'></i>
            </a> */}
          </div>
        </div>
      </div>
    </div>
  )
}
