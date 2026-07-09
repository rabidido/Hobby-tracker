import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Relative base so the build works from any path — including the
// GitHub Pages project subpath (https://<user>.github.io/Hobby-tracker/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
