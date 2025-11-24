import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' 
// 注意：如果您的檔案名是 app.jsx (小寫)，請改為 ./app.jsx，但建議統一改為大寫 App.jsx

// 基礎 CSS 重置 (因為沒有獨立的 index.css 檔案，我們用 JS 注入)
const style = document.createElement('style');
style.textContent = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f9fafb;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)