import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/weather-widget/', // <- MUST match the GitHub repo name!
  plugins: [react()]
});