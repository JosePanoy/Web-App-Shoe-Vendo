import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LandingPageMainNav from '../Landing-Page/main-nav'
import MainFooter from '../resuable-components/main-footer'
import '../../assets/css/updated_process/firsttime-setup.css'

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

const EXTRA_QUESTION_LABEL =
  'What is your go-to recovery meal after training sessions?'

const createDigits = length => Array.from({ length }, () => '')

function FirstTimeSetup () {
  const location = useLocation()
  const navigate = useNavigate()
  const initialId =
    (location?.state && location.state.idNumber) || ''.padStart(6, '')

  const [idDigits, setIdDigits] = useState(
    initialId && /^\d{6}$/.test(initialId)
      ? initialId.split('')
      : createDigits(6)
  )
  const [pinDigits, setPinDigits] = useState(createDigits(4))
  const [confirmDigits, setConfirmDigits] = useState(createDigits(4))
  const [security, setSecurity] = useState({
    fullName: '',
    firstName: '',
    lastName: '',
    favoriteLunchFood: '',
    extraAnswer: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const idRefs = useRef([])
  const pinRefs = useRef([])
  const confirmRefs = useRef([])

  const idNumber = idDigits.join('')
  const pincode = pinDigits.join('')
  const confirmPin = confirmDigits.join('')

  useEffect(() => {
    idRefs.current[0]?.focus()
  }, [])

  const handleDigitChange = (group, index, value) => {
    if (!/^\d?$/.test(value)) return
    const setter =
      group === 'id'
        ? setIdDigits
        : group === 'pin'
          ? setPinDigits
          : setConfirmDigits

    const buffer =
      group === 'id'
        ? [...idDigits]
        : group === 'pin'
          ? [...pinDigits]
          : [...confirmDigits]

    const refs =
      group === 'id'
        ? idRefs
        : group === 'pin'
          ? pinRefs
          : confirmRefs

    buffer[index] = value
    setter(buffer)

    if (value && index < buffer.length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (group, index, event) => {
    const refs = group === 'id' ? idRefs : group === 'pin' ? pinRefs : confirmRefs
    const digits =
      group === 'id'
        ? idDigits
        : group === 'pin'
          ? pinDigits
          : confirmDigits

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

  const handlePaste = (group, event) => {
    event.preventDefault()
    const pasted = (event.clipboardData.getData('text') || '').replace(/\D/g, '')
    if (!pasted) return

    const digits =
      group === 'id'
        ? createDigits(6)
        : group === 'pin'
          ? createDigits(4)
          : createDigits(4)

    for (let i = 0; i < digits.length && i < pasted.length; i += 1) {
      digits[i] = pasted[i]
    }

    if (group === 'id') {
      setIdDigits(digits)
      idRefs.current[Math.min(pasted.length - 1, digits.length - 1)]?.focus()
    } else if (group === 'pin') {
      setPinDigits(digits)
      pinRefs.current[Math.min(pasted.length - 1, digits.length - 1)]?.focus()
    } else {
      setConfirmDigits(digits)
      confirmRefs.current[Math.min(pasted.length - 1, digits.length - 1)]?.focus()
    }
  }

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (idNumber.length !== 6) {
      setError('Please provide your 6-digit athlete ID number.')
      return false
    }
    if (pincode.length !== 4) {
      setError('Please choose a 4-digit pincode.')
      return false
    }
    if (confirmPin !== pincode) {
      setError('Your confirmation pincode does not match.')
      return false
    }

    const missingField = Object.entries(security).find(
      ([, value]) => !value.trim()
    )
    if (missingField) {
      setError('All security questions are required for backup verification.')
      return false
    }

    return true
  }

  const handleSubmit = event => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!validateForm()) return
    setShowConfirm(true)
  }

  const completeSetup = async () => {
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/athletes/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idNumber,
          pincode,
          confirmPincode: confirmPin,
          firstName: security.firstName,
          lastName: security.lastName,
          securityAnswers: {
            ...security,
            extraQuestionLabel: EXTRA_QUESTION_LABEL
          }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Unable to complete onboarding.')
      }

      setSuccess(data?.message || 'Onboarding successful.')
      setShowConfirm(false)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1200)
    } catch (err) {
      setError(err.message || 'Unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='setup__layout'>
      <LandingPageMainNav />

      <motion.section
        className='setup__hero'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className='setup__card'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, type: 'spring', stiffness: 120 }}
        >
          <header className='setup__header'>
            <h1 className='setup__title'>First-Time Athlete Setup</h1>
            <p className='setup__subtitle'>
              Activate your account with a secure pincode and personal recovery
              details for identity verification.
            </p>
          </header>

          <form className='setup__form' onSubmit={handleSubmit}>
            <section className='setup__section'>
              <h2 className='setup__section-title'>Identity</h2>
              <div className='setup__field'>
                <label className='setup__label'>Athlete ID</label>
                <div className='setup__digit-grid'>
                  {idDigits.map((digit, index) => (
                    <input
                      key={`setup-id-${index}`}
                      type='text'
                      inputMode='numeric'
                      maxLength={1}
                      value={digit}
                      onChange={event =>
                        handleDigitChange('id', index, event.target.value)
                      }
                      onKeyDown={event => handleKeyDown('id', index, event)}
                      onPaste={event => handlePaste('id', event)}
                      ref={el => {
                        idRefs.current[index] = el
                      }}
                      className='setup__digit-input'
                      aria-label={`Athlete ID digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className='setup__section'>
              <h2 className='setup__section-title'>Choose Your Pincode</h2>
              <div className='setup__field'>
                <label className='setup__label'>New 4-digit pincode</label>
                <div className='setup__digit-grid setup__digit-grid--pin'>
                  {pinDigits.map((digit, index) => (
                    <input
                      key={`pin-${index}`}
                      type='password'
                      inputMode='numeric'
                      maxLength={1}
                      value={digit}
                      onChange={event =>
                        handleDigitChange('pin', index, event.target.value)
                      }
                      onKeyDown={event => handleKeyDown('pin', index, event)}
                      onPaste={event => handlePaste('pin', event)}
                      ref={el => {
                        pinRefs.current[index] = el
                      }}
                      className='setup__digit-input setup__digit-input--pin'
                      aria-label={`New pincode digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className='setup__field'>
                <label className='setup__label'>Confirm pincode</label>
                <div className='setup__digit-grid setup__digit-grid--pin'>
                  {confirmDigits.map((digit, index) => (
                    <input
                      key={`confirm-${index}`}
                      type='password'
                      inputMode='numeric'
                      maxLength={1}
                      value={digit}
                      onChange={event =>
                        handleDigitChange('confirm', index, event.target.value)
                      }
                      onKeyDown={event =>
                        handleKeyDown('confirm', index, event)
                      }
                      onPaste={event => handlePaste('confirm', event)}
                      ref={el => {
                        confirmRefs.current[index] = el
                      }}
                      className='setup__digit-input setup__digit-input--pin'
                      aria-label={`Confirm pincode digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className='setup__section'>
              <h2 className='setup__section-title'>Security Questions</h2>
              <div className='setup__questions'>
                <label className='setup__question'>
                  <span>What is your full name?</span>
                  <input
                    type='text'
                    value={security.fullName}
                    onChange={event =>
                      handleSecurityChange('fullName', event.target.value)
                    }
                    placeholder='e.g. Alex Jordan Cruz'
                  />
                </label>

                <label className='setup__question'>
                  <span>What is your given first name?</span>
                  <input
                    type='text'
                    value={security.firstName}
                    onChange={event =>
                      handleSecurityChange('firstName', event.target.value)
                    }
                    placeholder='First name'
                  />
                </label>

                <label className='setup__question'>
                  <span>What is your family / last name?</span>
                  <input
                    type='text'
                    value={security.lastName}
                    onChange={event =>
                      handleSecurityChange('lastName', event.target.value)
                    }
                    placeholder='Last name'
                  />
                </label>

                <label className='setup__question'>
                  <span>What is your go-to lunch food before practice?</span>
                  <input
                    type='text'
                    value={security.favoriteLunchFood}
                    onChange={event =>
                      handleSecurityChange(
                        'favoriteLunchFood',
                        event.target.value
                      )
                    }
                    placeholder='Favorite lunch food'
                  />
                </label>

                <label className='setup__question'>
                  <span>{EXTRA_QUESTION_LABEL}</span>
                  <input
                    type='text'
                    value={security.extraAnswer}
                    onChange={event =>
                      handleSecurityChange('extraAnswer', event.target.value)
                    }
                    placeholder='Your answer'
                  />
                </label>
              </div>
            </section>

            {error && <div className='setup__error'>{error}</div>}
            {success && <div className='setup__success'>{success}</div>}

            <div className='setup__actions'>
              <Link to='/login' className='setup__link'>
                Back to login
              </Link>
              <motion.button
                type='submit'
                className='setup__submit'
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save & Activate'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.section>

      <MainFooter />

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className='setup__modal-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='setup__modal'
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.86, opacity: 0 }}
            >
              <h2 className='setup__modal-title'>Confirm Activation</h2>
              <p className='setup__modal-text'>
                Activate athlete ID <strong>{idNumber}</strong> with your chosen
                pincode and the provided recovery answers?
              </p>
              <p className='setup__modal-text'>
                Double-check your entries. Your pincode remains hidden for safety.
              </p>
              <div className='setup__modal-actions'>
                <button
                  type='button'
                  className='setup__modal-btn setup__modal-btn--outline'
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                >
                  Review
                </button>
                <button
                  type='button'
                  className='setup__modal-btn setup__modal-btn--primary'
                  onClick={completeSetup}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Confirm & Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FirstTimeSetup
