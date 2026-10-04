import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// BASE_PATH задаётся при сборке для GitHub Pages (например, /habit-tracker/),
// локально используется корень — dev-сервер и preview работают как раньше.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
