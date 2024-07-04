import s from './styles.module.scss'
import { head } from 'helpers'
import { useEffect } from 'react'

export default function Main() {
  useEffect(() => {
    head({ title: 'SAMARTH PAL' })
  }, [])

  const portfolios = [
    {
      name: 'Daemonhive Technologies',
      url: 'https://daemonhive.com/',
      img: 'logo.png'
    },
    {
      name: 'Stashblog',
      url: 'https://stashblog.com/',
      img: 'logo.png'
    },
    {
      name: 'Joahquin Technologies',
      url: 'https://www.joahquin.com/',
      img: ''
    },
    {
      name: 'Zilliondines',
      url: 'https://www.zilliondines.com/',
      img: 'logo.png'
    },
    {
      name: 'BCN-INDIA',
      url: 'https://bcnindia.com/',
      img: 'logo.png'
    },
    {
      name: 'Headless SPAS',
      url: 'https://hless.pro/',
      img: 'logo.png'
    },
    {
      name: 'Yourganicx Nutrition',
      url: 'https://samarthpal.github.io/Yourganicx-Public/',
      img: 'assets/images1/logo%20%20new.png'
    },
    {
      name: 'Portfolio',
      url: '/',
      img: 'logo.png'
    },
    {
      name: 'Text Utils',
      url: 'https://samarthpal.github.io/TextUtils-React/',
      img: ''
    },
    {
      name: 'Sher Sweets',
      url: 'https://samarthpal.github.io/Sher-Sweets/',
      img: 'logo.png'
    },
    {
      name: 'Benelli Keeway',
      url: 'https://samarthpal.github.io/Benelli-Keeway/',
      img: 'logo.png'
    },
    {
      name: 'Bansal Nursing Home',
      url: 'https://samarthpal.github.io/Bansal-Nursing-Home/',
      img: 'logo.png'
    },
    {
      name: 'Cosmedicaa',
      url: 'https://samarthpal.github.io/Cosmedicaa/',
      img: 'logo.png'
    },
    {
      name: 'Dev Primus',
      url: 'https://samarthpal.github.io/Dev-Primus/',
      img: 'logo.png'
    }
  ]

  return (
    <div className={s.main} id='portfolio'>
      <div className={s.portfolioSection + ' indent'}>
        <div className='title'>Portfolio</div>
        <div className={s.portfolios}>
          {portfolios.map(({ name, url, img }, i) => (
            <a href={url} className={s.portfolio} target='_blank' key={i}>
              <span className='material-icons-outlined'>open_in_new</span>
              <div
                className={s.name}
                style={{
                  background:
                    i % 4 === 3
                      ? 'var(--c-redAlt)'
                      : i % 4 === 2
                        ? 'var(--c-yellowOrange)'
                        : i % 4 === 1
                          ? 'var(--c-green)'
                          : 'var(--c-blue)'
                }}
              >
                {name}
              </div>
              <div className={s.logo}>
                {img ? (
                  <img src={url + img} alt='' />
                ) : (
                  <div className={s.placeholderIcon}>
                    <span className='material-icons-outlined'>light_mode</span>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
