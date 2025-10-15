import React from 'react'
import { motion } from 'framer-motion'
import "../../../assets/css/admin-side/sup-pages/machine-monitoring.css"

import CyclesLogo from "../../../assets/icons/cycles.png"
import HumidityLogo from "../../../assets/icons/humidity.png"
import TemperatureLogo from "../../../assets/icons/temperature.png"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } },
}

function MachineMonitoringComponent() {
  // mock data
  const machine = {
    id: 'SV-01',
    status: 'Online',
    operation: 'In Use',
    temperature: '36°C',
    humidity: '45%',
    cycleCount: 1284,
    lastMaintenance: '2025-09-25T15:00:00',
    alerts: ['Low fogging solution', 'Shoe sensor misalignment'],
  }

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = d.getDate()
    const year = d.getFullYear()
    let hour = d.getHours()
    const minute = d.getMinutes().toString().padStart(2, '0')
    const ampm = hour >= 12 ? 'pm' : 'am'
    hour = hour % 12 || 12
    return `${month} ${day}, ${year} at ${hour}:${minute}${ampm}`
  }

  return (
    <div className='mmon_compo__root'>
      <motion.div className='mmon_compo__container' variants={container} initial='hidden' animate='show'>

        <motion.header className='mmon_compo__header' variants={item}>
          <h2 className='mmon_compo__title'>Machine Monitoring</h2>
          <div className='mmon_compo__meta'>ID: <strong>{machine.id}</strong></div>
        </motion.header>

        <motion.div className='mmon_compo__topgrid' variants={item}>
          <div className='mmon_compo__card mmon_compo__card--status'>
            <div className='mmon_compo__card-title'>Status</div>
            <div className='mmon_compo__card-value mmon_compo__status--online'>{machine.status}</div>
            <div className='mmon_compo__small'>Current operation: <span className='mmon_compo__op'>{machine.operation}</span></div>
          </div>

          <div className='mmon_compo__card mmon_compo__card--metrics'>
            <div className='mmon_compo__metric-row'>
              <div className='mmon_compo__metric'>
                <div className='mmon_compo__metric-icon'><img src={TemperatureLogo} alt='Temp' /></div>
                <div className='mmon_compo__metric-label'>Temp</div>
                <div className='mmon_compo__metric-value'>{machine.temperature}</div>
              </div>
              <div className='mmon_compo__metric'>
                <div className='mmon_compo__metric-icon'><img src={HumidityLogo} alt='Humidity' /></div>
                <div className='mmon_compo__metric-label'>Humidity</div>
                <div className='mmon_compo__metric-value'>{machine.humidity}</div>
              </div>
              <div className='mmon_compo__metric'>
                <div className='mmon_compo__metric-icon'><img src={CyclesLogo} alt='Cycles' /></div>
                <div className='mmon_compo__metric-label'>Cycles</div>
                <div className='mmon_compo__metric-value'>{machine.cycleCount}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className='mmon_compo__secondary' variants={item}>
          <div className='mmon_compo__card mmon_compo__card--maintenance'>
            <h4 className='mmon_compo__card-title'>Maintenance</h4>
            <ul className='mmon_compo__list'>
              <li>Last maintenance: <strong>{formatDateTime(machine.lastMaintenance)}</strong></li>
              <li>Next scheduled check: <strong>{formatDateTime('2025-10-30T09:00:00')}</strong></li>
              <li>Recommended: Replace fogging cartridge in 200 cycles</li>
            </ul>
          </div>

          <div className='mmon_compo__card mmon_compo__card--alerts'>
            <h4 className='mmon_compo__card-title'>Alerts</h4>
            {machine.alerts.length === 0 ? (
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

      </motion.div>
    </div>
  )
}

export default MachineMonitoringComponent