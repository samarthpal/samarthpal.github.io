import { Route, HashRouter as Router, Routes, useNavigate } from 'react-router-dom'
import defaultRoutes from './routes'
import { useEffect, useCallback, useRef, useState } from 'react'

export default function Main() {
  let routes = [...defaultRoutes]

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Redirect />} />

        {routes.map(({ path, Component, Super, auth }, i) => (
          <Route
            key={i}
            path={path}
            element={
              auth ? (
                <Auth>
                  <Super>
                    <Component />
                  </Super>
                </Auth>
              ) : Super ? (
                <Super>
                  <Component />
                </Super>
              ) : (
                <Component />
              )
            }
          />
        ))}

        <Route path='*' element={<Redirect />} />
      </Routes>
    </Router>
  )
}

const Redirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/home', { replace: true })
  }, [navigate])
  return null
}

const Auth = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const authenticated = useRef(false)
  const processing = useRef()

  const authTest = useCallback(async () => {
    if (processing.current) return

    processing.current = true

    if (!authenticated.current) {
      // const signInAPI = await api.auth.admin.getAdmin({})
      // if (signInAPI.code === 201) {
      //   authenticated.current = true
      //   setLoading(false)
      // } else {
      //   window.localStorage.clear()
      //   navigate('/login', { replace: true })
      // }
    } else setLoading(false)
    processing.current = false
  }, [])

  useEffect(() => {
    if (!window.localStorage.getItem('authorization')) navigate('/home', { replace: true })
    else authTest()
  }, [authTest, navigate])

  return loading ? <div>loading!!!</div> : <div style={{ overflow: 'hidden' }}>{children}</div>
}
