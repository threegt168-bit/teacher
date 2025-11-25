import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' 

// 【修正點】: 正確地導入 CSS 檔案。Vite 會處理這個導入並打包樣式。
import './index.css'; 

// 【已移除】: 移除舊的 JS 注入 CSS 的錯誤代碼。

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)