import s from './styles.module.scss'
import { sendMail } from 'helpers'
import { useRef, useState } from 'react'

export default function Main() {
  const [loading, setLoading] = useState(false)
  const processing = useRef(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const formHandler = async e => {
    if (processing.current) return
    processing.current = true
    setLoading(true)

    e.preventDefault()
    await sendMail(formData)

    processing.current = false
  }

  return (
    <div className={s.main} id='contact'>
      <div className={s.contactSection + ' indent'}>
        <div className='title'>Contact</div>
        <div className={s.contact}>
          <div className={s.links}>
            <LinkCard
              icon='email'
              title='E-mail Us'
              info='palsamarth02@gmail.com'
              link='mailto:palsamarth02@gmail.com'
            />
            <LinkCard icon='phone' title='Call Us' info='+91-9456000859' link='tel:+919456000859' />
            <LinkCard
              icon='location_on'
              title='Address'
              info='House no 17, azad nagar, moradabad, uttarpradesh, India, 244001'
              link="https://www.google.com/maps/dir//'28.850090,78.750982'/@28.8420253,78.7589551,14z/data=!4m6!4m5!1m0!1m3!2m2!1d78.750982!2d28.85009?entry=ttu"
            />
          </div>
          <div className={s.contactForm}>
            <form onSubmit={formHandler}>
              <Input
                type='text'
                name='name'
                label='Name'
                iconLeft='person'
                value={formData.name}
                onChange={handleChange}
                placeholder='Enter Your Name Here *'
                required
              />
              <Input
                type='email'
                name='email'
                label='E-mail'
                iconLeft='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter Your Email Here *'
                required
              />
              <TextArea
                name='message'
                label='Message'
                iconLeft='message'
                value={formData.message}
                onChange={handleChange}
                placeholder='Enter Your Message Here *'
                rows='5'
                required
              />
              <button type='submit' className={s.button} disabled={loading}>
                <div className={s.buttonInner}>
                  Send Message
                  <span className='material-icons-outlined'>send</span>
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const Input = props => (
  <div className={s.inputMain}>
    {!!props.label && <label className={s.label}>{props.label}</label>}
    <div className={s.inputField}>
      {props.iconLeft && (
        <span className={(props.isFilled ? 'material-icons ' : 'material-icons-outlined ') + s.iconLeft}>
          {props.iconLeft}
        </span>
      )}
      <input
        type={props.type}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className={props.class ? props.class + ' ' + s.input : s.input}
        required={props.required}
      />
    </div>
  </div>
)

const TextArea = props => (
  <div className={s.textAreaMain}>
    {!!props.label && <label className={s.label}>{props.label}</label>}
    <div className={s.textField}>
      {props.iconLeft && (
        <span className={(props.isFilled ? 'material-icons ' : 'material-icons-outlined ') + s.iconLeft}>
          {props.iconLeft}
        </span>
      )}
      <textarea
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className={props.class ? props.class + ' ' + s.textArea : s.textArea}
        rows={props.rows || '5'}
        cols={props.columns}
        required={props.required}
        autoComplete={props.autoComplete}
      />
    </div>
  </div>
)

const LinkCard = props => (
  <div className={s.linkCard}>
    <div className={s.icon}>
      <span className='material-icons-outlined '>{props.icon}</span>
    </div>
    <div className={s.info}>
      <div className={s.title}>{props.title}</div>
      <a href={props.link} target='_blank'>
        {props.info}
      </a>
    </div>
  </div>
)
