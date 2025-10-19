import React, { useEffect, useMemo, useRef, useState } from 'react'
import '../../assets/css/updated_process/use_clean__countdown.css'

function pad (n) { return String(n).padStart(2, '0') }

function UseCleanCountdown ({ durationSec = 60, onComplete }) {
  const start = useRef(Date.now())
  const [now, setNow] = useState(Date.now())

  const remaining = useMemo(() => {
    const elapsed = Math.floor((now - start.current) / 1000)
    return Math.max(0, durationSec - elapsed)
  }, [now, durationSec])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (remaining === 0) {
      const id = setTimeout(() => onComplete && onComplete(), 500)
      return () => clearTimeout(id)
    }
  }, [remaining, onComplete])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const pct = 100 - Math.round((remaining / durationSec) * 100)

  return (
    <div className='use_clean__countdown'>
      <h3>Sanitizing in progress</h3>
      <p>Please wait while we sanitize and dry your shoes.</p>
      <div className='use_clean__count-wrapper'>
        <div className='use_clean__circle' style={{ background: `conic-gradient(var(--uc-accent) ${pct}%, var(--uc-muted) ${pct}% 100%)` }}>
          <div className='use_clean__circle-inner'>
            <div className='use_clean__digits'>{pad(minutes)} : {pad(seconds)}</div>
          </div>
        </div>
      </div>
      <div className='use_clean__notice'>Please don’t open the machine while it’s working.</div>
    </div>
  )
}

export default UseCleanCountdown

