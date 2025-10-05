import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import "../../../assets/css/admin-side/sup-pages/settings.css"

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: -12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function SettingsComponent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const savedName = localStorage.getItem('adminName') || ''
    const savedEmail = localStorage.getItem('adminEmail') || ''
    setName(savedName)
    setEmail(savedEmail)
  }, [])

  // actual save action executed after confirmation
  const confirmSave = () => {
    if (password && password !== confirm) {
      setMsg({ type: 'error', text: 'Passwords do not match' })
      setConfirmOpen(false)
      return
    }
    localStorage.setItem('adminName', name)
    localStorage.setItem('adminEmail', email)
    if (password) localStorage.setItem('adminPassword', password)
    setPassword('')
    setConfirm('')
    setMsg({ type: 'success', text: 'Settings saved' })
    setConfirmOpen(false)
    setTimeout(() => setMsg(null), 2500)
  }

  // open confirmation modal instead of immediate save
  const handleSave = (e) => {
    e && e.preventDefault()
    setConfirmOpen(true)
  }

  return (
    <motion.div className='settings_compo__root' variants={container} initial='hidden' animate='show'>
      <motion.h2 className='settings_compo__title' variants={item}>Settings</motion.h2>

      <motion.form className='settings_compo__card' variants={item} onSubmit={handleSave}>
        <div className='settings_compo__section'>
          <h4 className='settings_compo__section-title'>Admin Preferences</h4>
          <div className='settings_compo__grid'>
            <label className='settings_compo__field'>
              <span>Super Admin Name</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder='Enter Name' />
            </label>
            <label className='settings_compo__field'>
              <span>Email</span>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder='email@domain.com' />
            </label>
          </div>
        </div>

        <div className='settings_compo__section'>
          <h4 className='settings_compo__section-title'>Account</h4>
          <div className='settings_compo__grid'>
            <label className='settings_compo__field'>
              <span>Change Password</span>
              <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Change Password' />
            </label>
            <label className='settings_compo__field'>
              <span>Confirm Password</span>
              <input type='password' value={confirm} onChange={e => setConfirm(e.target.value)} placeholder='Confirm Password' />
            </label>
          </div>
        </div>

        <div className='settings_compo__actions'>
          <button type='submit' className='settings_compo__btn'>Save Changes</button>
          {msg && (
            <div className={`settings_compo__msg ${msg.type}`}>{msg.text}</div>
          )}
        </div>
      </motion.form>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className='settings_compo__modal-overlay' role='dialog' aria-modal='true'>
          <div className='settings_compo__modal'>
            <h3>Confirm save</h3>
            <p>Are you sure you want to save these settings? This will overwrite the current admin preferences.</p>
            <div className='settings_compo__modal-actions'>
              <button className='settings_compo__modal-btn cancel' onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className='settings_compo__modal-btn confirm' onClick={confirmSave}>Yes, save</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SettingsComponent