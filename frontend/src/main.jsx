import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App'
import MainContentProcess from './components/process_page_components/main_content_process'
import './index.css'
import NotificationPage from './components/main-sub-pages/notification-page'
import GiftPage from './components/main-sub-pages/gift-page'
import UpdatePage from './components/main-sub-pages/update-page'
import EnterEmailCode from './components/process_page_components/enter_email_code'
import LoginAdmin from './components/admin-side/login-admin'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/enter-gmail" element={<MainContentProcess />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/updates" element={<UpdatePage />} />
        <Route path="/enter-code" element={<EnterEmailCode />} />
        <Route path="/gifts" element={<GiftPage />} />

        <Route path="/admin-log" element={<LoginAdmin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
