import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import "../../../assets/css/admin-side/sup-pages/dashboard.css"

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -70 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } },
}

function DashboardComponent() {
  const [summary, setSummary] = useState({ registeredAthletes: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required.')
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to load dashboard info.')
      }

      setSummary({
        registeredAthletes: Number.isFinite(data?.registeredAthletes)
          ? data.registeredAthletes
          : 0
      })
    } catch (err) {
      setError(err.message || 'Unable to load dashboard info.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const registeredAthletesDisplay = useMemo(() => {
    if (loading) return 'Loading...'
    return summary.registeredAthletes.toLocaleString()
  }, [loading, summary.registeredAthletes])

  const stats = [
    { title: 'Machine Status', value: 'Online', valueClass: 'dash_compo__status--online' },
    { title: 'Registered Athletes', value: registeredAthletesDisplay },
    { title: 'Rewards Claimed', value: '2' },
    { title: 'Maintenance Alerts', value: '1' },
  ]

  const recent = [
    { date: '2025-10-04', id: '56595', service: 'Standard Cleaning', status: 'Completed' },
  ]

  const formatDateFriendly = (dateStr) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = d.getDate()
    const year = d.getFullYear()
    let hour = d.getHours()
    const minute = d.getMinutes().toString().padStart(2, '0')
    const ampm = hour >= 12 ? 'pm' : 'am'
    hour = hour % 12 || 12
    return `${month} ${day}, ${year} - ${hour}:${minute}${ampm}`
  }

  return (
    <div className='dash_compo__root'>
      <motion.div
        className='dash_compo__container'
        variants={containerVariants}
        initial='hidden'
        animate='show'
      >
        {error && (
          <div className='dash_compo__alert'>
            <span>{error}</span>
            <button type='button' onClick={loadSummary}>Retry</button>
          </div>
        )}

        <div className='dash_compo__stats'>
          {stats.map((s, i) => (
            <motion.div key={i} className='dash_compo__stat-card' variants={itemVariants}>
              <div className='dash_compo__stat-title'>{s.title}</div>
              <div className={`dash_compo__stat-value ${s.valueClass || ''}`}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className='dash_compo__info-row'>
          <motion.div className='dash_compo__large-card' variants={itemVariants}>
            <h4 className='dash_compo__card-title'>Machine Status</h4>
            <ul className='dash_compo__bullet-list'>
              <li>
                <strong>Status:</strong> <span className='dash_compo__status--inline'>Online</span>
              </li>
              <li>
                <strong>Current Operation:</strong> <span className='dash_compo__status--inline'>In Used</span>
              </li>
            </ul>
          </motion.div>

          <motion.div className='dash_compo__small-card' variants={itemVariants}>
            <h4 className='dash_compo__card-title'>Maintenance</h4>
            <ul className='dash_compo__bullet-list'>
              <li>Low fogging solution</li>
            </ul>
          </motion.div>
        </div>

        <motion.div className='dash_compo__recent' variants={itemVariants}>
          <h4 className='dash_compo__card-title'>Recent Activity</h4>
          <div className='dash_compo__table-wrap'>
            <table className='dash_compo__table'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student ID</th>
                  <th>Service Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, idx) => (
                  <tr key={idx}>
                    <td>{formatDateFriendly(r.date)}</td>
                    <td>{r.id}</td>
                    <td>{r.service}</td>
                    <td className='dash_compo__status--completed'>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default DashboardComponent
