import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import "../../../assets/css/admin-side/sup-pages/machine-monitoring.css"

import CyclesLogo from "../../../assets/icons/cycles.png"
import HumidityLogo from "../../../assets/icons/humidity.png"
import TemperatureLogo from "../../../assets/icons/temperature.png"

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, x: -50 }, show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } } }

function MachineMonitoringComponent() {
  const [machine, setMachine] = useState({
    id: 'SV-01', status: 'N/A', operation: 'N/A', temperature: null, humidity: null,
    cycleCount: null, lastMaintenance: null, alerts: []
  })
  const [live, setLive] = useState(false)
  const [error, setError] = useState('')

  const formatDateTime = (dateStr) => {
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

  useEffect(() => {
    let es
    const token = localStorage.getItem('token')
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/machine/status`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        const data = await res.json().catch(() => ({}))
        if (res.ok) setMachine((prev) => ({ ...prev, ...data }))
      } catch {}
    }
    fetchStatus()

    try {
      const t = localStorage.getItem('token')
      const q = t ? `?token=${encodeURIComponent(t)}` : ''
      es = new EventSource(`${API_BASE_URL}/api/machine/stream${q}`)
      setLive(true)
      es.onmessage = (ev) => {
        try { const data = JSON.parse(ev.data); setMachine((p) => ({ ...p, ...data })) } catch {}
      }
      es.onerror = () => { setLive(false) }
    } catch (_) { setLive(false); setError('Live stream unavailable') }

    const poll = setInterval(fetchStatus, 10000)
    return () => { clearInterval(poll); try { es?.close() } catch {} }
  }, [])

  const statusClass = useMemo(() => {
    const s = (machine.status || '').toLowerCase()
    if (s === 'in-use' || s === 'online') return 'mmon_compo__status--online'
    if (s === 'error') return 'mmon_compo__status--error'
    return 'mmon_compo__status--standby'
  }, [machine.status])

  return (
    <div className='mmon_compo__root'>
      <motion.div className='mmon_compo__container' variants={container} initial='hidden' animate='show'>

        <motion.header className='mmon_compo__header' variants={item}>
          <h2 className='mmon_compo__title'>Machine Monitoring</h2>
          <div className='mmon_compo__meta'>ID: <strong>{machine.id}</strong> · <span>{live ? 'Live' : 'Disconnected'}</span></div>
        </motion.header>

        <motion.div className='mmon_compo__topgrid' variants={item}>
          <div className='mmon_compo__card mmon_compo__card--status'>
            <div className='mmon_compo__card-title'>Status</div>
            <div className={`mmon_compo__card-value ${statusClass}`}>{machine.status || 'N/A'}</div>
            <div className='mmon_compo__small'>Current operation: <span className='mmon_compo__op'>{machine.operation || 'N/A'}</span></div>
          </div>

          <div className='mmon_compo__card mmon_compo__card--metrics'>
            <div className='mmon_compo__metric-row'>
              <div className='mmon_compo__metric'>
                <div className='mmon_compo__metric-icon'><img src={TemperatureLogo} alt='Temp' /></div>
                <div className='mmon_compo__metric-label'>Temp</div>
                <div className='mmon_compo__metric-value'>{typeof machine.temperature === 'number' ? `${machine.temperature}°C` : 'N/A'}</div>
              </div>
              <div className='mmon_compo__metric'>
                <div className='mmon_compo__metric-icon'><img src={HumidityLogo} alt='Humidity' /></div>
                <div className='mmon_compo__metric-label'>Humidity</div>
                <div className='mmon_compo__metric-value'>{typeof machine.humidity === 'number' ? `${machine.humidity}%` : 'N/A'}</div>
              </div>
              <div className='mmon_compo__metric'>
                <div className='mmon_compo__metric-icon'><img src={CyclesLogo} alt='Cycles' /></div>
                <div className='mmon_compo__metric-label'>Cycles</div>
                <div className='mmon_compo__metric-value'>{machine.cycleCount ?? 'N/A'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className='mmon_compo__secondary' variants={item}>
          <div className='mmon_compo__card mmon_compo__card--maintenance'>
            <h4 className='mmon_compo__card-title'>Maintenance</h4>
            <ul className='mmon_compo__list'>
              <li>Last maintenance: <strong>{machine.lastMaintenance ? formatDateTime(machine.lastMaintenance) : 'N/A'}</strong></li>
              <li>Next scheduled check: <strong>N/A</strong></li>
              <li>Recommended: Replace fogging cartridge in 200 cycles</li>
            </ul>
          </div>

          <div className='mmon_compo__card mmon_compo__card--alerts'>
            <h4 className='mmon_compo__card-title'>Alerts</h4>
            {(machine.alerts || []).length === 0 ? (
              <div className='mmon_compo__no-alerts'>No alerts</div>
            ) : (
              <ul className='mmon_compo__list mmon_compo__list--alerts'>
                {machine.alerts.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        {error && <div className='mmon_compo__error'>{error}</div>}
      </motion.div>
    </div>
  )
}

export default MachineMonitoringComponent
