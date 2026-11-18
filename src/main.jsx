import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import 'styles/global.scss'

// Pinned scroll scenes need a predictable start position after reloads.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
