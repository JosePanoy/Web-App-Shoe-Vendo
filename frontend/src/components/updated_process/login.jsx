import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import LandingPageMainNav from '../Landing-Page/main-nav'
import MainFooter from '../resuable-components/main-footer'
import '../../assets/css/updated_process/login-component.css'

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

const buildDigitArray = length => Array.from({ length }, () => '')

function LoginComponent () {
  const [idDigits, setIdDigits] = useState(buildDigitArray(6))
  const [pinDigits, setPinDigits] = useState(buildDigitArray(4))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [reminder, setReminder] = useState(true)

  const idRefs = useRef([])
  const pinRefs = useRef([])
  const navigate = useNavigate()

  const idNumber = idDigits.join('')
  const pincode = pinDigits.join('')

  const resetPinInputs = () => {
    setPinDigits(buildDigitArray(4))
    pinRefs.current[0]?.focus()
  }

  const handleDigitChange = (type, index, value) => {
    if (!/^\d?$/.test(value)) return
    const setter = type === 'id' ? setIdDigits : setPinDigits
    const refs = type === 'id' ? idRefs : pinRefs
    const digits = type === 'id' ? [...idDigits] : [...pinDigits]

    digits[index] = value
    setter(digits)

    if (value && index < digits.length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (type, index, event) => {
    const refs = type === 'id' ? idRefs : pinRefs
    const digits = type === 'id' ? idDigits : pinDigits

    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < digits.length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (type, event) => {
    event.preventDefault()
    const text = (event.clipboardData.getData('text') || '').replace(/\D/g, '')
    if (!text) return

    const digits = type === 'id' ? buildDigitArray(6) : buildDigitArray(4)
    for (let i = 0; i < digits.length && i < text.length; i += 1) {
      digits[i] = text[i]
    }

    if (type === 'id') {
      setIdDigits(digits)
      idRefs.current[Math.min(text.length, digits.length - 1)]?.focus()
    } else {
      setPinDigits(digits)
      pinRefs.current[Math.min(text.length, digits.length - 1)]?.focus()
    }
  }

  const handleSubmit = event => {
    event.preventDefault()
    setError('')

    if (idNumber.length !== 6) {
      setError('Please enter your complete 6-digit athlete ID.')
      return
    }

    if (pincode.length !== 4) {
      setError('Please enter your full 4-digit pincode.')
      return
    }

    setShowConfirm(true)
  }

  const executeLogin = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/athlete/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idNumber,
          pincode
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Unable to login.')
      }

      localStorage.setItem('athleteToken', data.token)
      localStorage.setItem(
        'athleteProfile',
        JSON.stringify({
          fname: data.fname,
          lname: data.lname,
          idNumber: data.idNumber
        })
      )

      if (data.firstLogin) {
        navigate('/athlete/setup', { state: { idNumber: data.idNumber } })
        return
      }

      navigate('/athlete/dashboard')
    } catch (err) {
      setError(err.message || 'Unexpected error occurred.')
      resetPinInputs()
    } finally {
      setSubmitting(false)
      setShowConfirm(false)
    }
  }

  useEffect(() => {
    idRefs.current[0]?.focus()
  }, [])

  return (
    <div className='login__layout'>
      <LandingPageMainNav />

      <motion.section
        className='login__hero'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className='login__card'
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 120 }}
        >
          <div className='login__card-header'>
            <h1 className='login__title'>Athlete Secure Login</h1>
            <p className='login__subtitle'>
              Enter your 6-digit athlete ID and 4-digit pincode to continue.
            </p>
          </div>

          <form className='login__form' onSubmit={handleSubmit}>
            <div className='login__input-group'>
              <span className='login__group-label'>Athlete ID</span>
              <div className='login__digit-grid'>
                {idDigits.map((digit, index) => (
                  <input
                    key={`id-${index}`}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    ref={el => {
                      idRefs.current[index] = el
                    }}
                    onKeyDown={event => handleKeyDown('id', index, event)}
                    onChange={event =>
                      handleDigitChange('id', index, event.target.value)
                    }
                    onPaste={event => handlePaste('id', event)}
                    className='login__digit-input'
                    aria-label={`ID digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className='login__input-group'>
              <span className='login__group-label'>Pincode</span>
              <div className='login__digit-grid login__digit-grid--pin'>
                {pinDigits.map((digit, index) => (
                  <input
                    key={`pin-${index}`}
                    type='password'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    ref={el => {
                      pinRefs.current[index] = el
                    }}
                    onKeyDown={event => handleKeyDown('pin', index, event)}
                    onChange={event =>
                      handleDigitChange('pin', index, event.target.value)
                    }
                    onPaste={event => handlePaste('pin', event)}
                    className='login__digit-input login__digit-input--pin'
                    aria-label={`Pincode digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {error && <div className='login__error'>{error}</div>}

            <motion.button
              type='submit'
              className='login__submit'
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
            >
              {submitting ? 'Verifying...' : 'Login'}
            </motion.button>
          </form>

          <div className='login__footer-actions'>
            <button
              type='button'
              className='login__reminder-toggle'
              onClick={() => setReminder(current => !current)}
            >
              {reminder ? 'Hide' : 'Show'} quick reminders
            </button>
            <Link className='login__link' to='/athlete/setup'>
              First time logging in? Activate your account
            </Link>
          </div>

          <AnimatePresence>
            {reminder && (
              <motion.ul
                className='login__reminders'
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <li>Keep your pincode private and never share it with others.</li>
                <li>Use the setup link if this is your first time logging in.</li>
                <li>Contact the athletic office if you suspect unauthorized access.</li>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      <MainFooter />

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className='login__modal-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='login__modal'
              role='dialog'
              aria-modal='true'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className='login__modal-title'>Confirm Login Details</h2>
              <p className='login__modal-text'>
                Please confirm you want to sign in with ID{' '}
                <strong>{idNumber}</strong>.
              </p>
              <p className='login__modal-text'>
                Your pincode will remain hidden for your security.
              </p>
              <div className='login__modal-actions'>
                <button
                  type='button'
                  className='login__modal-btn login__modal-btn--outline'
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                >
                  Review
                </button>
                <button
                  type='button'
                  className='login__modal-btn login__modal-btn--primary'
                  onClick={executeLogin}
                  disabled={submitting}
                >
                  {submitting ? 'Signing in...' : 'Confirm & Continue'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LoginComponent
