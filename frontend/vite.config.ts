import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 프론트에서 /api 로 시작하는 요청을 FastAPI 서버(8000번 포트)로 넘겨줌
    // → 브라우저 입장에서는 같은 주소라서 CORS 설정이 필요 없어요.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
