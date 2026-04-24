import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/read-simulator/', // gh-pages 배포 시 레포 이름으로 변경
})
