/** @type {import('tailwindcss').Config} */
export default {
  // 設置 content 以確保 Tailwind 掃描所有 JSX/JS/HTML 檔案來生成需要的樣式
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}