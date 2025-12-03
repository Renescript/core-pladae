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
