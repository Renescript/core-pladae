import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    // VITE_PROXY_TARGET=http://127.0.0.1:3000 apunta a un back local; también se
    // pasan /alumnos y /users para poder iniciar sesión (Mi cuenta) en desarrollo.
    proxy: Object.fromEntries(
      (process.env.VITE_PROXY_TARGET ? ['/api', '/alumnos', '/users'] : ['/api']).map((prefix) => [prefix, {
        target: process.env.VITE_PROXY_TARGET || 'https://academy-mgmt-ye8h.onrender.com',
        changeOrigin: true,
        secure: false,
      }])
    )
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      '@aldabil/react-scheduler',
      'react-big-calendar',
      'moment',
      '@schedule-x/react',
      '@schedule-x/calendar',
    ],
  },
})
