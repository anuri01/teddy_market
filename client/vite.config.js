import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
     allowedHosts: [
      'c5c8070cfd81.ngrok-free.app',
      'localhost', // localhost도 함께 추가하는 것이 좋습니다.
    ],
    host: true,
    // https: true,  // ✅ HTTPS 활성화
    port: 5173
  }
})
