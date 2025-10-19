import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MainFooter from '../resuable-components/main-footer'
import '../../assets/css/updated_process/athlete-dashboard.css'

// New flow components
import UseCleanStart from './use_clean__Start'
import UseCleanDetection from './use_clean__Detection'
import UseCleanPackageSelect from './use_clean__PackageSelect'
import UseCleanCoinWait from './use_clean__CoinWait'
import UseCleanCountdown from './use_clean__Countdown'
import UseCleanVoucherModal from './use_clean__VoucherModal'

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')
// Feature flags (default off; enable via env/localStorage when needed)
const FORCE_SHOE_DETECT = (import.meta.env.VITE_FORCE_SHOE_DETECT === 'true') || (localStorage.getItem('forceShoeDetect') === 'true') || false
const FORCE_COIN_MATCH = (import.meta.env.VITE_FORCE_COIN_MATCH === 'true') || (localStorage.getItem('forceCoinMatch') === 'true') || false

function AthleteDashboard () {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Cleaning flow state
  const [step, setStep] = useState('idle')
  const [detectedShoes, setDetectedShoes] = useState(null)
  const [lastImageUrl, setLastImageUrl] = useState('')
  const [selectedPackage, setSelectedPackage] = useState(null) // {type: 'standard'|'deep', price: number, durationSec: number}
  const [voucherCount, setVoucherCount] = useState(0)
  const [stampCount, setStampCount] = useState(0)
  const [showVoucherModal, setShowVoucherModal] = useState(false)

  const fullName = useMemo(
    () =>
      profile
        ? `${profile.fname || 'Athlete'} ${profile.lname || ''}`.trim()
        : 'Athlete',
    [profile]
  )

  const usageKey = useMemo(
    () => (profile?.idNumber ? `athleteUses:${profile.idNumber}` : null),
    [profile?.idNumber]
  )

  const loadUsage = () => {
    if (!usageKey) return
    try {
      const raw = localStorage.getItem(usageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      setVoucherCount(parsed.vouchers || 0)
      setStampCount(parsed.stamps || 0)
    } catch {}
  }

  const saveUsage = (updater) => {
    if (!usageKey) return
    const current = (() => {
      try {
        return JSON.parse(localStorage.getItem(usageKey)) || { vouchers: 0, stamps: 0 }
      } catch { return { vouchers: 0, stamps: 0 } }
    })()
    const next = updater(current)
    localStorage.setItem(usageKey, JSON.stringify(next))
    setVoucherCount(next.vouchers)
    setStampCount(next.stamps)
  }

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

  useEffect(() => { loadUsage() }, [usageKey])

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

  // API helpers
  const api = {
    async checkForShoes () {
      if (FORCE_SHOE_DETECT) {
        return { found: true }
      }
      const res = await fetch(`${API_BASE_URL}/machine/check-for-shoes`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to check for shoes')
      return data // { found: boolean, imageUrl?: string }
    },
    async waitForCoin (expectedValue) {
      if (FORCE_COIN_MATCH) {
        return { value: Number(expectedValue || 0) }
      }
      const res = await fetch(`${API_BASE_URL}/machine/wait-for-coin`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to read coin')
      return data // { value: number }
    },
    async startCleaning (type) {
      const endpoint = type === 'deep' ? 'start-deep-cleaning' : 'start-basic-cleaning'
      const res = await fetch(`${API_BASE_URL}/machine/${endpoint}`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Failed to start cleaning')
      }
    }
  }

  // Flow actions
  const onInitiate = () => setStep('ask-inserted')

  const onConfirmShoesInserted = async () => {
    setStep('checking')
    try {
      const data = await api.checkForShoes()
      setDetectedShoes(Boolean(data?.found))
      setLastImageUrl(data?.imageUrl || '')
      setStep(Boolean(data?.found) ? 'detection-ok' : 'no-shoes')
    } catch (e) {
      setError(e.message)
      setStep('idle')
    }
  }

  const onProceedAfterDetection = () => setStep('select-package')

  const onSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
    setStep('confirm-package')
  }

  const onConfirmPackage = async (useVoucher = false) => {
    if (useVoucher) {
      setVoucherCount((v) => v)
      setStep('confirm-start-cleaning')
      return
    }
    setStep('coin-wait')
  }

  const onCoinReceived = (value) => {
    const needed = selectedPackage?.price || 0
    if (value !== needed) {
      setError(`Inserted coin ₱${value} does not match required ₱${needed}. Please try again.`)
      setStep('coin-wait')
      return false
    }
    setStep('confirm-start-cleaning')
    return true
  }

  const onStartCleaning = async (useVoucher = false) => {
    try {
      await api.startCleaning(selectedPackage.type)
    } catch (e) {
      setError(e.message)
      setStep('select-package')
      return
    }
    setStep('countdown')
  }

  const onCleaningComplete = (usedVoucher) => {
    // record usage locally: 1 free voucher for every 6 paid uses
    if (usedVoucher) {
      saveUsage((cur) => ({ ...cur, vouchers: Math.max(0, (cur.vouchers || 0) - 1) }))
    } else {
      saveUsage((cur) => {
        const stamps = (cur.stamps || 0) + 1
        if (stamps >= 6) {
          return { vouchers: (cur.vouchers || 0) + 1, stamps: 0 }
        }
        return { vouchers: cur.vouchers || 0, stamps }
      })
    }
    setShowVoucherModal(true)
  }

  const resetFlow = () => {
    setStep('idle')
    setDetectedShoes(null)
    setLastImageUrl('')
    setSelectedPackage(null)
    setError('')
  }

  if (!API_BASE_URL) {
    return (
      <div className='dashboard__layout'>
        <motion.section className='dashboard__hero' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className='dashboard__card'>
            <h2 style={{ color: '#0f243e', marginTop: 0 }}>Configuration required</h2>
            <p style={{ color: 'rgba(0,0,0,.8)' }}>
              Missing API base URL. Set VITE_API_BASE_URL in your frontend .env.
            </p>
          </div>
        </motion.section>
      </div>
    )
  }

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

          {error && <div className='dashboard__error'>{error}</div>}

          <div className='dashboard__flow'>
            {step === 'idle' && (
              <UseCleanStart
                voucherCount={voucherCount}
                stampCount={stampCount}
                onInitiate={onInitiate}
              />
            )}

            {step === 'ask-inserted' && (
              <UseCleanStart.AskInserted
                onCancel={resetFlow}
                onConfirm={onConfirmShoesInserted}
              />
            )}

            {step === 'checking' && (
              <UseCleanDetection.Checking />
            )}

            {step === 'no-shoes' && (
              <UseCleanDetection.NoShoes
                imageUrl={lastImageUrl}
                onRetry={() => setStep('ask-inserted')}
                onCancel={resetFlow}
              />
            )}

            {step === 'detection-ok' && (
              <UseCleanDetection.Detected
                imageUrl={lastImageUrl}
                onProceed={onProceedAfterDetection}
                onCancel={resetFlow}
              />
            )}

            {step === 'select-package' && (
              <UseCleanPackageSelect
                voucherCount={voucherCount}
                onSelect={onSelectPackage}
                onBack={() => setStep('detection-ok')}
              />
            )}

            {step === 'confirm-package' && (
              <UseCleanPackageSelect.Confirm
                selected={selectedPackage}
                voucherCount={voucherCount}
                onUseVoucher={() => {
                  if (voucherCount > 0) {
                    setSelectedPackage((p) => p ? { ...p, price: 0 } : p)
                    setStep('confirm-start-cleaning')
                  }
                }}
                onProceed={() => onConfirmPackage(false)}
                onBack={() => setStep('select-package')}
              />
            )}

            {step === 'coin-wait' && (
              <UseCleanCoinWait
                price={selectedPackage?.price || 0}
                onBack={() => setStep('confirm-package')}
                onReadCoin={async () => {
                  try {
                    const data = await api.waitForCoin(selectedPackage?.price || 0)
                    onCoinReceived(Number(data?.value || 0))
                  } catch (e) {
                    setError(e.message)
                  }
                }}
              />
            )}

            {step === 'confirm-start-cleaning' && (
              <UseCleanDetection.ConfirmStart
                selected={selectedPackage}
                hasVoucher={voucherCount > 0}
                onBack={() => (selectedPackage?.price ? setStep('coin-wait') : setStep('confirm-package'))}
                onStart={() => onStartCleaning(voucherCount > 0 && selectedPackage?.price === 0)}
              />
            )}

            {step === 'countdown' && (
              <UseCleanCountdown
                durationSec={selectedPackage?.durationSec || 60}
                onComplete={() => onCleaningComplete(selectedPackage?.price === 0)}
              />
            )}
          </div>

          <div className='dashboard__actions'>
            <motion.button
              type='button'
              className='dashboard__logout'
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLogoutConfirm(true)}
            >
              Logout
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      <MainFooter />

      <AnimatePresence>
        {showLogoutConfirm && (
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
                  onClick={() => setShowLogoutConfirm(false)}
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

      <UseCleanVoucherModal
        open={showVoucherModal}
        vouchers={voucherCount}
        stamps={stampCount}
        onClose={() => {
          setShowVoucherModal(false)
          resetFlow()
        }}
      />
    </div>
  )
}

export default AthleteDashboard
