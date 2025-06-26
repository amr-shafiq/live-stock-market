import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'  // Import path from Node.js

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // this points '@' to your 'src' folder
    },
  },
})
