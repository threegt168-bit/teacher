import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設置基礎路徑為 './'，以確保在 Vercel 或其他非根目錄部署環境中，
  // 靜態資源（CSS, JS）能使用相對路徑正確載入。
  base: './',
})