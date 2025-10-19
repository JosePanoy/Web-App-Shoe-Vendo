import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import "../../../assets/css/admin-side/sup-pages/settings.css"

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: -12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

function SettingsComponent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reauthOpen, setReauthOpen] = useState(false)
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token || !API_BASE_URL) return
        const res = await fetch(`${API_BASE_URL}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          setName(`${data.fname || ''} ${data.lname || ''}`.trim())
          setEmail(data.email || '')
        }
      } catch { /* ignore */ }
    }
    load()
  }, [])

  // actual save action executed after confirmation
  const confirmSave = async () => {
    if (password && password !== confirm) {
      setMsg({ type: 'error', text: 'Passwords do not match' })
      setConfirmOpen(false)
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token || !API_BASE_URL) throw new Error('Configuration missing')
      const [fname, ...rest] = name.split(' ')
      const lname = rest.join(' ').trim()
      const body = { fname: fname || name, lname, email }
      if (password) { body.newPassword = password; body.currentPassword = currentPassword }
      const res = await fetch(`${API_BASE_URL}/api/admin/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to update profile')
      setCurrentPassword(''); setPassword(''); setConfirm('')
      setMsg({ type: 'success', text: 'Settings saved' })
      setTimeout(() => setMsg(null), 2500)
      setReauthOpen(true)
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Unable to save' })
    } finally {
      setConfirmOpen(false)
    }
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
              <span>Current Password</span>
              <input type='password' value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder='Current Password' />
            </label>
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

      <motion.div className='settings_compo__card' variants={item}>
        <h4 className='settings_compo__section-title'>Add another admin</h4>
        <p style={{ color: '#555', marginTop: -6, marginBottom: 10 }}>Adding administrators requires proper authorization by system owners and developers. Proceed only if you have explicit approval.</p>
        {!showAddAdmin ? (
          <div className='settings_compo__actions' style={{ marginTop: 8 }}>
            <button className='settings_compo__btn' onClick={() => setShowAddAdmin(true)}>Add Admin</button>
          </div>
        ) : (
          <AddAdminForm />
        )}
      </motion.div>

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

      {reauthOpen && (
        <div className='settings_compo__modal-overlay' role='dialog' aria-modal='true'>
          <div className='settings_compo__modal'>
            <h3>Re-login recommended</h3>
            <p>For security and to apply the latest changes to your admin profile, please sign out and log in again.</p>
            <div className='settings_compo__modal-actions'>
              <button className='settings_compo__modal-btn cancel' onClick={() => setReauthOpen(false)}>Later</button>
              <button
                className='settings_compo__modal-btn confirm'
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token')
                    if (token && API_BASE_URL) {
                      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
                    }
                  } catch {}
                  localStorage.removeItem('token')
                  navigate('/admin-log')
                }}
              >Log out now</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SettingsComponent

function AddAdminForm () {
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [email, setEmail] = useState('')
  const [pincode, setPincode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState(null)

  const submit = async () => {
    if (!fname || !lname || !email || !pincode || !password) {
      setMsg({ type: 'error', text: 'All fields are required' }); setOpen(false); return
    }
    if (password !== confirm) { setMsg({ type: 'error', text: 'Passwords do not match' }); setOpen(false); return }
    try {
      const token = localStorage.getItem('token')
      if (!token || !API_BASE_URL) throw new Error('Configuration missing')
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fname, lname, email, pincode, password })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to add admin')
      setMsg({ type: 'success', text: 'Admin account created.' })
      setFname(''); setLname(''); setEmail(''); setPincode(''); setPassword(''); setConfirm('')
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Unable to add admin' })
    } finally {
      setOpen(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  return (
    <>
      <div className='settings_compo__grid' style={{ marginTop: 10 }}>
        <label className='settings_compo__field'><span>First name</span><input value={fname} onChange={e=>setFname(e.target.value)} placeholder='First name' /></label>
        <label className='settings_compo__field'><span>Last name</span><input value={lname} onChange={e=>setLname(e.target.value)} placeholder='Last name' /></label>
        <label className='settings_compo__field'><span>Email</span><input value={email} onChange={e=>setEmail(e.target.value)} placeholder='email@domain.com' /></label>
        <label className='settings_compo__field'><span>Admin pincode</span><input value={pincode} onChange={e=>setPincode(e.target.value)} placeholder='6-digit code' /></label>
        <label className='settings_compo__field'><span>Password</span><input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='Create password' /></label>
        <label className='settings_compo__field'><span>Confirm password</span><input type='password' value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder='Confirm password' /></label>
      </div>
      <div className='settings_compo__actions' style={{ marginTop: 12 }}>
        <button className='settings_compo__btn' onClick={()=>setOpen(true)}>Add Admin</button>
        {msg && <div className={`settings_compo__msg ${msg.type}`}>{msg.text}</div>}
      </div>

      {open && (
        <div className='settings_compo__modal-overlay' role='dialog' aria-modal='true'>
          <div className='settings_compo__modal'>
            <h3>Confirm administrator addition</h3>
            <p>Adding a new admin may require authorization from the system owners and/or the developers. Proceed only if you have explicit approval. Do you want to continue?</p>
            <div className='settings_compo__modal-actions'>
              <button className='settings_compo__modal-btn cancel' onClick={()=>setOpen(false)}>Cancel</button>
              <button className='settings_compo__modal-btn confirm' onClick={submit}>Yes, add admin</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
