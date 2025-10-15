import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MainFooter from '../resuable-components/main-footer'
import '../../assets/css/updated_process/athlete-dashboard.css'

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

function AthleteDashboard () {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('athleteToken')
    const storedProfile = localStorage.getItem('athleteProfile')
    if (!token || !storedProfile) {
      navigate('/login', { replace: true })
      return
    }

    try {
      const parsed = JSON.parse(storedProfile)
      setProfile(parsed)
    } catch {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const handleLogout = async () => {
    setProcessing(true)
    setError('')

    const token = localStorage.getItem('athleteToken')

    try {
      await fetch(`${API_BASE_URL}/api/auth/athlete/logout`, {
        method: 'POST',
        headers: token
          ? {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          : { 'Content-Type': 'application/json' }
      })
    } catch (err) {
      setError('Logout request encountered an issue, please try again.')
      setProcessing(false)
      return
    }

    localStorage.removeItem('athleteToken')
    localStorage.removeItem('athleteProfile')
    setProcessing(false)
    navigate('/login', { replace: true })
  }

  const fullName = profile
    ? `${profile.fname || 'Athlete'} ${profile.lname || ''}`.trim()
    : 'Athlete'

  return (
    <div className='dashboard__layout'>

      <motion.section
        className='dashboard__hero'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className='dashboard__card'
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, type: 'spring', stiffness: 110 }}
        >
          <header className='dashboard__header'>
            <p className='dashboard__welcome'>You are securely signed in.</p>
            <h1 className='dashboard__title'>Hello, {fullName}</h1>
            {profile?.idNumber && (
              <span className='dashboard__id'>
                Athlete ID: <strong>{profile.idNumber}</strong>
              </span>
            )}
          </header>

          <div className='dashboard__content'>
            <p>
              Access your athlete-exclusive shoe care perks, track machine status,
              and review service history. Protect your pincode and security answers
              to keep your account secure.
            </p>
            <p>
              Need to update your security responses or forgot your pincode?
              Reach out to the athletic office for assistance.
            </p>
          </div>

          {error && <div className='dashboard__error'>{error}</div>}

          <div className='dashboard__actions'>
            <motion.button
              type='button'
              className='dashboard__logout'
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowConfirm(true)}
            >
              Logout
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      <MainFooter />

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className='dashboard__modal-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='dashboard__modal'
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
            >
              <h2 className='dashboard__modal-title'>Confirm Logout</h2>
              <p className='dashboard__modal-text'>
                Are you sure you want to end your session? You will need your
                4-digit pincode to sign in again.
              </p>
              <div className='dashboard__modal-actions'>
                <button
                  type='button'
                  className='dashboard__modal-btn dashboard__modal-btn--outline'
                  onClick={() => setShowConfirm(false)}
                  disabled={processing}
                >
                  Stay Signed In
                </button>
                <button
                  type='button'
                  className='dashboard__modal-btn dashboard__modal-btn--danger'
                  onClick={handleLogout}
                  disabled={processing}
                >
                  {processing ? 'Logging out...' : 'Confirm Logout'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AthleteDashboard
