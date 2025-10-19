import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { LineChart, ScatterChart } from '@mui/x-charts'

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

const PERIODS = ['day', 'week', 'month', 'year']

function useUsageData () {
  const [period, setPeriod] = useState('week')
  const [buckets, setBuckets] = useState([])
  const [tz, setTz] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async (p = period) => {
    if (!API_BASE_URL) return
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required.')
      const res = await fetch(`${API_BASE_URL}/api/admin/stats/usage?period=${encodeURIComponent(p)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load usage stats')
      setBuckets(Array.isArray(data?.buckets) ? data.buckets : [])
      setTz(typeof data?.tz === 'string' ? data.tz : '')
    } catch (err) {
      setError(err.message || 'Unable to load usage stats')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData(period) }, [fetchData, period])

  // SSE refresh: when a machine usage event arrives, refetch
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !API_BASE_URL) return undefined
    let es
    try {
      es = new EventSource(`${API_BASE_URL}/api/admin/audit/stream?token=${encodeURIComponent(token)}`)
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data)
          const a = (payload.action || '').toUpperCase()
          if (a.includes('CLEAN') || a.includes('COIN') || payload.recipe || payload.amount) {
            fetchData()
          }
        } catch {}
      }
    } catch {}
    return () => { try { es?.close() } catch {} }
  }, [fetchData])

  return { period, setPeriod, buckets, tz, loading, error }
}

const ChartCard = ({ title, children }) => (
  <div className='dash_compo__chart-card'>
    <div className='dash_compo__chart-title'>{title}</div>
    <div className='dash_compo__chart-body'>{children}</div>
  </div>
)

export default function AdminUsageCharts () {
  const { period, setPeriod, buckets, tz, loading, error } = useUsageData()

  const labels = useMemo(() => buckets.map(b => b.label), [buckets])
  const totals = useMemo(() => buckets.map(b => b.total), [buckets])
  const standardPts = useMemo(() => buckets.map(b => ({ x: new Date(b.ts), y: b.standard })), [buckets])
  const deepPts = useMemo(() => buckets.map(b => ({ x: new Date(b.ts), y: b.deep })), [buckets])
  const hasLineData = useMemo(() => totals.length > 0, [totals])
  const hasScatterData = useMemo(() => (standardPts.length > 0 || deepPts.length > 0), [standardPts, deepPts])

  const xTimeFormatter = useCallback((value) => {
    try {
      const d = value instanceof Date ? value : new Date(value)
      if (period === 'day') return d.toLocaleString('en-US', { hour: 'numeric', hour12: true, timeZone: tz || undefined })
      if (period === 'year') return d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: tz || undefined })
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: tz || undefined })
    } catch {
      return String(value)
    }
  }, [period, tz])

  const xMin = useMemo(() => (buckets[0]?.ts ? new Date(buckets[0].ts) : undefined), [buckets])
  const xMax = useMemo(() => (buckets.length ? new Date(buckets[buckets.length - 1].ts) : undefined), [buckets])

  return (
    <div className='dash_compo__charts'>
      <div className='dash_compo__charts-head'>
        <div className='dash_compo__charts-title'>Machine Usage Statistics</div>
        <div className='dash_compo__segmented'>
          {PERIODS.map(p => (
            <button
              key={p}
              className={`dash_compo__segbtn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
              disabled={loading}
            >{p[0].toUpperCase() + p.slice(1)}</button>
          ))}
        </div>
      </div>
      {error && <div className='dash_compo__alert' style={{ marginBottom: 10 }}>{error}</div>}
      <div className='dash_compo__charts-grid'>
        <ChartCard title='Total cleans over time'>
          {(!loading && !hasLineData) ? (
            <div className='dash_compo__alert' style={{ padding: 12 }}>No data for this period.</div>
          ) : (
            <LineChart
              height={280}
              xAxis={[{ scaleType: 'point', data: labels }]}
              series={[{ id: 'total', label: 'Total', data: totals, color: '#0f243e' }]}
              tooltip={{ trigger: 'item' }}
              loading={loading}
            />
          )}
        </ChartCard>
        <ChartCard title='Standard vs Deep by time'>
          {(!loading && !hasScatterData) ? (
            <div className='dash_compo__alert' style={{ padding: 12 }}>No data for this period.</div>
          ) : (
            <ScatterChart
              height={280}
              xAxis={[{ scaleType: 'time', valueFormatter: xTimeFormatter, min: xMin, max: xMax }]}
              yAxis={[{ label: 'Count' }]}
              series={[
                { id: 'standard', label: 'Standard', data: standardPts, color: '#0f6d3e' },
                { id: 'deep', label: 'Deep', data: deepPts, color: '#b80f3e' }
              ].filter(s => Array.isArray(s.data) && s.data.length > 0)}
              loading={loading}
            />
          )}
        </ChartCard>
      </div>
    </div>
  )
}
