import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import MainContentProcess from './components/process_page_components/main_content_process'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/enter-gmail" element={<MainContentProcess />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
