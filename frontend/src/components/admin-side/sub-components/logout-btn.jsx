import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

function LogoutBtn () {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    try {
      if (API_BASE_URL && token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem('token')
      sessionStorage.removeItem('adminWelcomeShown')
      navigate('/')
    }
  }

  return (
    <>
      <button className='sidebar-logout-btn' onClick={() => setShowModal(true)}>
        <LogOut
          size={18}
          style={{ marginRight: '8px', transform: 'rotate(180deg)' }}
        />
        Logout
      </button>

      {showModal && (
        <div className='logout-modal-bg'>
          <div className='logout-modal'>
            <div className='logout-modal-title'>Confirm Logout</div>
            <div className='logout-modal-desc'>
              Are you sure you want to log out?
            </div>
            <div className='logout-modal-actions'>
              <button
                className='logout-modal-btn confirm'
                onClick={handleLogout}
              >
                Yes
              </button>
              <button
                className='logout-modal-btn cancel'
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
.sidebar-logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  font-weight: bold;
  font-size: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: linear-gradient(135deg, #1c1c1c, #3a3a3a);
  color: #fff;
  transition: background 0.3s, transform 0.2s;
}

.sidebar-logout-btn:hover {
  background: linear-gradient(135deg, #2a2a2a, #505050);
  transform: translateY(-2px);
}

.logout-modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-modal {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  padding: 32px 24px;
  min-width: 280px;
  text-align: center;
  border: 2px solid #003050;
}

.logout-modal-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: #003050;
}

.logout-modal-desc {
  font-size: 1rem;
  color: #222;
  margin-bottom: 24px;
}

.logout-modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.logout-modal-btn {
  padding: 8px 24px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.logout-modal-btn.confirm {
  background: #003050;
  color: #fff;
}

.logout-modal-btn.cancel {
  background: #e0e0e0;
  color: #222;
}

.logout-modal-btn.confirm:hover {
  background: #005080;
  transform: translateY(-2px);
}

.logout-modal-btn.cancel:hover {
  background: #cccccc;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .sidebar-logout-btn {
    padding: 10px 0;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .sidebar-logout-btn {
    padding: 8px 0;
    font-size: 13px;
  }
}

@media (max-width: 380px) {
  .sidebar-logout-btn {
    padding: 6px 0;
    font-size: 12px;
  }
}
      `}</style>
    </>
  )
}

export default LogoutBtn
