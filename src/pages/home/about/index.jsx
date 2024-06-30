import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'
import images from 'images'

export default function Main() {
  useEffect(() => {
    head({ title: 'SAMARTH PAL' })
  }, [])
  return (
    <div className={s.main}>
      <div className={s.about + ' indent'}>
        <div className={s.cardOuter}>
          <div className={s.card}>
            <div className={s.cardFront}>
              <img src={images.Me} alt='' />
            </div>
            <div className={s.cardBack}>
              <div className={s.title}>Full Stack Developer</div>
              <div className={s.cardBackInner}>
                <a href='/' className={s.icon}>
                  <i className='fa-brands fa-facebook'></i>
                </a>
                <a href='/' className={s.icon}>
                  <i className='fa-brands fa-instagram'></i>
                </a>
                <a href='/' className={s.icon}>
                  <i className='fa-brands fa-linkedin-in'></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className={s.aboutMe}>
          <div className={s.title}>About Me</div>
          <div className={s.desc}>
            Hello! I am Samarth Kumar Pal. I am not an extraordinary person, I'm just like the others. Where I stand
            today is just because of my hard work, dedication and because of my family. I like being challanged
            specially by myself. No one is successful one hundred percent of the time. I believe if we keep on trying we
            will surely achieve our goal. Even Thomas Alva Edison failed many times before inventing the bulb. I think
            failure is just another step towards success.
          </div>
          <div className={s.info}>
            <div className={s.infoChild}>
              <div>Name:</div>
              <div>Samarth Kumar Pal</div>
            </div>
            <div className={s.infoChild}>
              <div>Date of birth:</div>
              <div>June 23, 2000</div>
            </div>
            <div className={s.infoChild}>
              <div>Address:</div>
              <div>Moradabad, UttarPradesh, India, 244001</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
