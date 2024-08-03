import s from './styles.module.scss'

export default function Main() {
  const portfolios = [
    {
      name: 'Daemonhive Technologies',
      url: 'https://daemonhive.com/',
      img: 'https://daemonhive.com/logo.png'
    },
    {
      name: 'Stashblog',
      url: 'https://stashblog.com/',
      img: 'https://stashblog.com/logo.png'
    },
    {
      name: 'Joahquin Technologies',
      url: 'https://www.joahquin.com/',
      img: 'https://www.joahquin.com/logo/joahquin.png'
    },
    {
      name: 'Joahquin Connect',
      url: 'https://play.google.com/store/apps/details?id=com.joahquin.connect',
      img: 'https://play-lh.googleusercontent.com/QFGswaHCn2OE97CGE6lFDqlvVml6E1loiGCskFzkMFcI9CH3rtRuMJ-FlUyF63oHeuVs=w240-h480-rw'
    },
    {
      name: 'Zilliondines',
      url: 'https://www.zilliondines.com/',
      img: 'https://www.zilliondines.com/logo.png'
    },
    {
      name: 'BCN-INDIA',
      url: 'https://bcnindia.com/',
      img: 'https://bcnindia.com/logo.png'
    },
    {
      name: 'Headless SPAS',
      url: 'https://hless.pro/',
      img: 'https://hless.pro/logo.png'
    },
    {
      name: 'Mopwna Cling',
      url: 'https://mopwnacling.com/',
      img: 'https://mopwnacling.com/logo.png'
    },
    {
      name: 'Yourganicx Nutrition',
      url: 'https://samarthpal.github.io/Yourganicx-Public/',
      img: 'https://samarthpal.github.io/Yourganicx-Public/assets/images1/logo%20%20new.png'
    },
    // {
    //   name: 'Portfolio',
    //   url: '/',
    //   img: '/logo.png'
    // },
    {
      name: 'Text Utils',
      url: 'https://samarthpal.github.io/TextUtils-React/',
      img: ''
      // https://samarthpal.github.io/TextUtils-React/favicon.ico
    },
    {
      name: 'Sher Sweets',
      url: 'https://samarthpal.github.io/Sher-Sweets/',
      img: 'https://samarthpal.github.io/Sher-Sweets/logo.png'
    },
    {
      name: 'Benelli Keeway',
      url: 'https://samarthpal.github.io/Benelli-Keeway/',
      img: 'https://samarthpal.github.io/Benelli-Keeway/logo.png'
    },
    {
      name: 'Bansal Nursing Home',
      url: 'https://samarthpal.github.io/Bansal-Nursing-Home/',
      img: 'https://samarthpal.github.io/Bansal-Nursing-Home/logo.png'
    },
    {
      name: 'Cosmedicaa',
      url: 'https://samarthpal.github.io/Cosmedicaa/',
      img: 'https://samarthpal.github.io/Cosmedicaa/logo.png'
    },
    {
      name: 'Dev Primus',
      url: 'https://samarthpal.github.io/Dev-Primus/',
      img: 'https://samarthpal.github.io/Dev-Primus/logo.png'
    }
  ]

  return (
    <div className={s.main} id='portfolio'>
      <div className={s.portfolioSection + ' indent'}>
        <div className='title'>Portfolio</div>
        <div className={s.portfolios}>
          {portfolios.map(({ name, url, img }, i) => (
            <PortfolioCard name={name} url={url} img={img} index={i} key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

const PortfolioCard = props => (
  <a href={props.url} className={s.portfolioOuter} target='_blank' rel='noreferrer'>
    <div className={s.portfolio}>
      <span className='material-icons-outlined'>open_in_new</span>
      <div
        className={s.name}
        style={{
          background:
            props.index % 4 === 3
              ? 'var(--c-redAlt)'
              : props.index % 4 === 2
                ? 'var(--c-yellowOrange)'
                : props.index % 4 === 1
                  ? 'var(--c-green)'
                  : 'var(--c-blue)'
        }}
      >
        {props.name}
      </div>
      <div className={s.logo}>
        {props.img ? (
          <img src={props.img} alt='' />
        ) : (
          <div className={s.placeholderIcon}>
            <span className='material-icons-outlined'>light_mode</span>
          </div>
        )}
      </div>
    </div>
    <div className={s.nameResponsive}>{props.name}</div>
  </a>
)
