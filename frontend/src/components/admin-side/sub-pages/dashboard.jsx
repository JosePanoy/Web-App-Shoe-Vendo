import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import "../../../assets/css/admin-side/sup-pages/dashboard.css"
import AdminUsageCharts from '../sub-components/admin-usage-charts'

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
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
  const [audit, setAudit] = useState({ items: [], nextCursor: null })
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')
  const newestRef = useRef(null)
  const cursorsRef = useRef([]) // history of cursors for Prev
  const [machine, setMachine] = useState({ status: 'N/A', operation: 'N/A', temperature: 'N/A', humidity: 'N/A' })
  const [machineError, setMachineError] = useState('')

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

  const loadMachine = useCallback(async () => {
    setMachineError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required.')
      const res = await fetch(`${API_BASE_URL}/api/machine/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Machine not connected')
      const data = await res.json()
      setMachine({
        status: data?.status || 'N/A',
        operation: data?.operation || data?.currentOperation || 'N/A',
        temperature: Number.isFinite(data?.temperature) ? `${data.temperature}°C` : 'N/A',
        humidity: Number.isFinite(data?.humidity) ? `${data.humidity}%` : 'N/A'
      })
    } catch (err) {
      setMachine({ status: 'N/A', operation: 'N/A', temperature: 'N/A', humidity: 'N/A' })
      setMachineError(err.message || 'Machine status unavailable')
    }
  }, [API_BASE_URL])

  useEffect(() => {
    loadMachine()
    const id = setInterval(loadMachine, 5000)
    return () => clearInterval(id)
  }, [loadMachine])

  const loadAudit = useCallback(async (opts = {}) => {
    const { before = null, since = null, replace = false } = opts
    setAuditLoading(true)
    setAuditError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required.')
      const params = new URLSearchParams()
      params.set('limit', '20')
      if (before) params.set('before', before)
      if (since) params.set('since', since)
      const res = await fetch(`${API_BASE_URL}/api/admin/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load audit log')
      if (since) {
        // Prepend new items
        if (Array.isArray(data.items) && data.items.length) {
          setAudit(prev => {
            const existing = prev.items || []
            const merged = [...data.items, ...existing]
            return { items: merged.slice(0, 200), nextCursor: prev.nextCursor }
          })
        }
      } else {
        // Fresh page
        setAudit({ items: data.items || [], nextCursor: data.nextCursor || null })
        if (!replace) {
          const last = (data.items || [])[data.items.length - 1]
          if (last && last._id) cursorsRef.current.push(last._id)
        }
      }
      const newest = (data.items || [])[0]
      if (newest && newest.createdAt) newestRef.current = newest.createdAt
    } catch (err) {
      setAuditError(err.message || 'Unable to load audit log')
    } finally {
      setAuditLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    loadAudit({ replace: true })
  }, [loadAudit])

  // Real-time: SSE stream with token fallback to polling
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return undefined
    let es
    try {
      es = new EventSource(`${API_BASE_URL}/api/admin/audit/stream?token=${encodeURIComponent(token)}`)
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data)
          setAudit(prev => ({ items: [payload, ...(prev.items || [])].slice(0, 200), nextCursor: prev.nextCursor }))
          if (payload?.createdAt) newestRef.current = payload.createdAt
        } catch {}
      }
      es.onerror = () => {
        // Silent: the polling below will still run
      }
    } catch {}

    const pollId = setInterval(() => {
      if (newestRef.current) {
        loadAudit({ since: newestRef.current, replace: true })
      }
    }, 15000)

    return () => {
      clearInterval(pollId)
      if (es && es.close) es.close()
    }
  }, [API_BASE_URL, loadAudit])

  const registeredAthletesDisplay = useMemo(() => {
    if (loading) return 'Loading...'
    return summary.registeredAthletes.toLocaleString()
  }, [loading, summary.registeredAthletes])

  const stats = [
    { title: 'Machine Status', value: machine.status || 'N/A', valueClass: machine.status === 'Online' ? 'dash_compo__status--online' : '' },
    { title: 'Registered Athletes', value: registeredAthletesDisplay },
    { title: 'Rewards Claimed', value: '2' },
    { title: 'Maintenance Alerts', value: machineError ? 'N/A' : '—' },
  ]

  const formatDateAudit = (dateStr) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = d.getDate()
    const year = d.getFullYear()
    let hour = d.getHours()
    const minute = d.getMinutes().toString().padStart(2, '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
    return `${month} ${day}, ${year} at ${hour}:${minute} ${ampm}`
  }

  const recent = useMemo(() => {
    const filtered = (audit.items || []).filter(it => {
      const a = (it.action || '').toUpperCase()
      return a.includes('CLEAN') || a.includes('COIN') || it.recipe || it.amount
    })
    const rows = filtered.slice(0, 5).map(it => {
      const service = it.recipe ? (it.recipe === 'deep' ? 'Deep Cleaning' : 'Standard Cleaning') : '—'
      let status = '—'
      const a = (it.action || '').toUpperCase()
      if (a.includes('DONE')) status = 'Completed'
      else if (a.includes('START')) status = 'Started'
      else if (a.includes('COIN')) status = 'Coin'
      return {
        date: it.createdAt,
        id: it.actorName || it.actorId || '—',
        service,
        status
      }
    })
    return rows
  }, [audit.items])

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

        <AdminUsageCharts />

        <div className='dash_compo__info-row'>
          <motion.div className='dash_compo__large-card' variants={itemVariants}>
            <h4 className='dash_compo__card-title'>Machine Status</h4>
            <ul className='dash_compo__bullet-list'>
              <li><strong>Status:</strong> <span className='dash_compo__status--inline'>{machine.status || 'N/A'}</span></li>
              <li><strong>Current Operation:</strong> <span className='dash_compo__status--inline'>{machine.operation || 'N/A'}</span></li>
              <li><strong>Temp:</strong> {machine.temperature} &nbsp; <strong>Humidity:</strong> {machine.humidity}</li>
              {machineError ? (<li style={{ color: '#b3261e' }}>{machineError}</li>) : null}
            </ul>
          </motion.div>

          <motion.div className='dash_compo__small-card' variants={itemVariants}>
            <h4 className='dash_compo__card-title'>Maintenance</h4>
            <ul className='dash_compo__bullet-list'>
              <li>Temperature: {machine.temperature}</li>
              <li>Humidity: {machine.humidity}</li>
              {!machineError ? null : <li>Status: N/A</li>}
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
                {recent.length ? recent.map((r, idx) => (
                  <tr key={idx}>
                    <td>{formatDateAudit(r.date)}</td>
                    <td>{r.id}</td>
                    <td>{r.service}</td>
                    <td className='dash_compo__status--completed'>{r.status}</td>
                  </tr>
                )) : (
                  <tr><td colSpan='4'>No recent activity</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div className='dash_compo__audit' variants={itemVariants}>
          <div className='dash_compo__audit-head'>
            <div className='dash_compo__audit-title'>Audit Log</div>
            {auditError && <div className='dash_compo__alert' style={{ margin: 0 }}>{auditError}</div>}
          </div>
          <div className='dash_compo__audit-tablewrap'>
            <table className='dash_compo__audit-table'>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Recipe</th>
                  <th>Amount</th>
                  <th>Session</th>
                </tr>
              </thead>
              <tbody>
                {audit.items.map((it, idx) => (
                  <tr key={it._id || idx}>
                    <td>{formatDateAudit(it.createdAt)}</td>
                    <td>{it.actorName || it.actorId || '—'}</td>
                    <td>{it.actorRole || '—'}</td>
                    <td>
                      <span className={`dash_compo__badge ${
                        (it.action || '').includes('LOGIN') ? 'dash_compo__badge--login'
                        : (it.action || '').includes('START') ? 'dash_compo__badge--start'
                        : (it.action || '').includes('DONE') ? 'dash_compo__badge--done' : ''
                      }`}>{it.action}</span>
                    </td>
                    <td>{it.recipe || '—'}</td>
                    <td>{it.amount ? `₱${it.amount}` : '—'}</td>
                    <td>{it.sessionId || '—'}</td>
                  </tr>
                ))}
                {!audit.items.length && (
                  <tr>
                    <td colSpan='7'>{auditLoading ? 'Loading…' : 'No audit entries yet'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className='dash_compo__audit-actions'>
            <button
              className='dash_compo__audit-btn'
              disabled={auditLoading || cursorsRef.current.length <= 1}
              onClick={() => {
                // Go to previous page: pop last cursor and load before the new last
                cursorsRef.current.pop()
                const prevCursor = cursorsRef.current[cursorsRef.current.length - 1]
                loadAudit({ before: prevCursor, replace: true })
              }}
            >Prev</button>
            <button
              className='dash_compo__audit-btn'
              disabled={auditLoading || !audit.nextCursor}
              onClick={() => loadAudit({ before: audit.nextCursor })}
            >Next</button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default DashboardComponent
