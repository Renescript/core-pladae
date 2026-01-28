import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@schedule-x/theme-default/dist/index.css'
import App from './App.jsx'

// StrictMode desactivado temporalmente para pruebas de rendimiento
// Nota: StrictMode duplica renders en desarrollo, lo que puede causar lentitud
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />,
  // </StrictMode>,
)
