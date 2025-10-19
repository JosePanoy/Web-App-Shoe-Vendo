import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import LandingPageMainNav from '../Landing-Page/main-nav'
import MainFooter from '../resuable-components/main-footer'
import '../../assets/css/updated_process/forgot-pin.css'

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')

const buildDigitArray = length => Array.from({ length }, () => '')

const stepVariants = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 }
}

function ForgotPin () {
  const navigate = useNavigate()

  const [step, setStep] = useState('identify')
  const [idDigits, setIdDigits] = useState(buildDigitArray(6))
  const [newPinDigits, setNewPinDigits] = useState(buildDigitArray(4))
  const [confirmDigits, setConfirmDigits] = useState(buildDigitArray(4))
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [remainingResets, setRemainingResets] = useState(null)
  const [blocked, setBlocked] = useState(false)

  const [error, setError] = useState('')
  const [info, setInfo] = useState(
    'Resetting your pincode is a privilege. You are accountable for keeping it secure.'
  )
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const idRefs = useRef([])
  const newPinRefs = useRef([])
  const confirmRefs = useRef([])

  const idNumber = idDigits.join('')
  const newPin = newPinDigits.join('')
  const confirmPin = confirmDigits.join('')

  useEffect(() => {
    idRefs.current[0]?.focus()
  }, [])

  const getDigitConfig = group => {
    if (group === 'id') {
      return {
        digits: idDigits,
        setter: setIdDigits,
        refs: idRefs,
        length: 6
      }
    }
    if (group === 'newPin') {
      return {
        digits: newPinDigits,
        setter: setNewPinDigits,
        refs: newPinRefs,
        length: 4
      }
    }
    return {
      digits: confirmDigits,
      setter: setConfirmDigits,
      refs: confirmRefs,
      length: 4
    }
  }

  const handleDigitChange = (group, index, value) => {
    if (!/^\d?$/.test(value)) return
    const { digits, setter, refs, length } = getDigitConfig(group)
    const buffer = [...digits]
    buffer[index] = value
    setter(buffer)

    if (value && index < length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (group, index, event) => {
    const { digits, refs } = getDigitConfig(group)

    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      refs.current[index - 1]?.focus()
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < digits.length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleDigitPaste = (group, event) => {
    event.preventDefault()
    const text = (event.clipboardData.getData('text') || '').replace(/\D/g, '')
    if (!text) return

    const { digits, setter, refs, length } = getDigitConfig(group)
    const buffer = [...digits]
    for (let i = 0; i < length && i < text.length; i += 1) {
      buffer[i] = text[i]
    }
    setter(buffer)
    const nextIndex = Math.min(text.length, length - 1)
    refs.current[nextIndex]?.focus()
  }

  const handleAnswerChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const resetPinInputs = () => {
    setNewPinDigits(buildDigitArray(4))
    setConfirmDigits(buildDigitArray(4))
    newPinRefs.current[0]?.focus()
  }

  const handleStartSubmit = async event => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (idNumber.length !== 6) {
      setError('Please enter your complete 6-digit athlete ID.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/athletes/forgot-pin/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idNumber })
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 423 && data?.blocked) {
          setBlocked(true)
        }
        throw new Error(data?.message || 'Unable to process reset request.')
      }

      setBlocked(false)
      setQuestions(data?.questions || [])
      const initialAnswers = (data?.questions || []).reduce((acc, question) => {
        acc[question.key] = ''
        return acc
      }, {})
      setAnswers(initialAnswers)
      setRemainingResets(
        typeof data?.remainingResets === 'number'
          ? data.remainingResets
          : null
      )
      setInfo(
        'Answer each recovery question exactly as you saved it during activation.'
      )
      resetPinInputs()
      setStep('verify')
    } catch (err) {
      setError(err.message || 'Unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async event => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const missing = questions.find(question => !answers[question.key]?.trim())
    if (missing) {
      setError('Please answer all recovery questions before continuing.')
      return
    }

    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setError('Enter and confirm your new 4-digit pincode.')
      return
    }

    if (newPin !== confirmPin) {
      setError('Your confirmation pincode does not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/athletes/forgot-pin/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idNumber,
          answers,
          newPincode: newPin,
          confirmPincode: confirmPin
        })
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 423 && data?.blocked) {
          setBlocked(true)
        }
        throw new Error(data?.message || 'Unable to reset your pincode.')
      }

      setBlocked(Boolean(data?.blocked))
      setSuccess(data?.message || 'Pincode reset successfully.')
      setRemainingResets(
        typeof data?.remainingResets === 'number'
          ? data.remainingResets
          : null
      )
      setInfo(
        'Your new pincode is active. Memorize it and keep it confidential.'
      )
      setStep('success')
    } catch (err) {
      setError(err.message || 'Unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const restartProcess = () => {
    setStep('identify')
    setQuestions([])
    setAnswers({})
    setRemainingResets(null)
    setBlocked(false)
    setError('')
    setSuccess('')
    setInfo(
      'Resetting your pincode is a privilege. You are accountable for keeping it secure.'
    )
    setIdDigits(buildDigitArray(6))
    resetPinInputs()
    idRefs.current[0]?.focus()
  }

  const remainingCopy =
    typeof remainingResets === 'number'
      ? `You have ${remainingResets} self-service reset${
          remainingResets === 1 ? '' : 's'
        } remaining.`
      : 'You may request up to three self-service resets for the lifetime of your account.'

  return (
    <div className='forgot__layout'>
      <LandingPageMainNav />

      <motion.section
        className='forgot__hero'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <motion.div
          className='forgot__card'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, type: 'spring', stiffness: 110 }}
        >
          <header className='forgot__header'>
            <span className='forgot__badge'>Secure Recovery</span>
            <h1 className='forgot__title'>Forgot Your Pincode?</h1>
            <p className='forgot__subtitle'>
              Verify your identity with your recovery answers to set a brand new
              4-digit pincode.
            </p>
          </header>

          <AnimatePresence mode='wait'>
            {step === 'identify' && (
              <motion.form
                key='identify-step'
                className='forgot__form'
                onSubmit={handleStartSubmit}
                variants={stepVariants}
                initial='initial'
                animate='animate'
                exit='exit'
              >
                <div className='forgot__section'>
                  <h2 className='forgot__section-title'>Confirm Your ID</h2>
                  <p className='forgot__helper'>
                    Enter your 6-digit athlete ID to start the recovery
                    process.
                  </p>
                  <div className='forgot__digit-grid'>
                    {idDigits.map((digit, index) => (
                      <input
                        key={`forgot-id-${index}`}
                        type='text'
                        inputMode='numeric'
                        maxLength={1}
                        value={digit}
                        onChange={event =>
                          handleDigitChange('id', index, event.target.value)
                        }
                        onKeyDown={event =>
                          handleDigitKeyDown('id', index, event)
                        }
                        onPaste={event => handleDigitPaste('id', event)}
                        ref={el => {
                          idRefs.current[index] = el
                        }}
                        className='forgot__digit-input'
                        aria-label={`Athlete ID digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className='forgot__accountability'>
                  <p>
                    Self-service resets are limited to three per athlete. Further
                    resets require in-person verification with the athletic
                    office.
                  </p>
                  <p>{remainingCopy}</p>
                </div>

                <div className='forgot__actions'>
                  <motion.button
                    type='submit'
                    className='forgot__submit'
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                  >
                    {loading ? 'Checking...' : 'Continue'}
                  </motion.button>
                  <Link className='forgot__link' to='/login'>
                    Back to login
                  </Link>
                </div>
              </motion.form>
            )}

            {step === 'verify' && (
              <motion.form
                key='verify-step'
                className='forgot__form'
                onSubmit={handleResetSubmit}
                variants={stepVariants}
                initial='initial'
                animate='animate'
                exit='exit'
              >
                <div className='forgot__section'>
                  <h2 className='forgot__section-title'>Recovery Questions</h2>
                  <p className='forgot__helper'>
                    Answer each question exactly as you did during first-time
                    setup.
                  </p>
                  <div className='forgot__questions'>
                    {questions.map(question => (
                      <label
                        key={question.key}
                        className='forgot__question'
                      >
                        <span>{question.prompt}</span>
                        <input
                          type='text'
                          value={answers[question.key] || ''}
                          onChange={event =>
                            handleAnswerChange(question.key, event.target.value)
                          }
                          placeholder='Your answer'
                          autoComplete='off'
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className='forgot__section'>
                  <h2 className='forgot__section-title'>Create New Pincode</h2>
                  <p className='forgot__helper'>
                    Enter your new 4-digit pincode twice. The digits must match.
                  </p>

                  <div className='forgot__pin-wrap'>
                    <div>
                      <span className='forgot__label'>New pincode</span>
                      <div className='forgot__digit-grid forgot__digit-grid--pin'>
                        {newPinDigits.map((digit, index) => (
                          <input
                            key={`forgot-new-${index}`}
                            type='password'
                            inputMode='numeric'
                            maxLength={1}
                            value={digit}
                            onChange={event =>
                              handleDigitChange(
                                'newPin',
                                index,
                                event.target.value
                              )
                            }
                            onKeyDown={event =>
                              handleDigitKeyDown('newPin', index, event)
                            }
                            onPaste={event => handleDigitPaste('newPin', event)}
                            ref={el => {
                              newPinRefs.current[index] = el
                            }}
                            className='forgot__digit-input forgot__digit-input--pin'
                            aria-label={`New pincode digit ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className='forgot__label'>Confirm pincode</span>
                      <div className='forgot__digit-grid forgot__digit-grid--pin'>
                        {confirmDigits.map((digit, index) => (
                          <input
                            key={`forgot-confirm-${index}`}
                            type='password'
                            inputMode='numeric'
                            maxLength={1}
                            value={digit}
                            onChange={event =>
                              handleDigitChange(
                                'confirmPin',
                                index,
                                event.target.value
                              )
                            }
                            onKeyDown={event =>
                              handleDigitKeyDown('confirmPin', index, event)
                            }
                            onPaste={event =>
                              handleDigitPaste('confirmPin', event)
                            }
                            ref={el => {
                              confirmRefs.current[index] = el
                            }}
                            className='forgot__digit-input forgot__digit-input--pin'
                            aria-label={`Confirm pincode digit ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='forgot__accountability forgot__accountability--note'>
                    <p>
                      Treat your recovery answers as confidential information.
                      Repeated incorrect attempts may flag your account for
                      review.
                    </p>
                    <p>{remainingCopy}</p>
                  </div>
                </div>

                <div className='forgot__actions'>
                  <motion.button
                    type='submit'
                    className='forgot__submit'
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset pincode'}
                  </motion.button>
                  <button
                    type='button'
                    className='forgot__link forgot__link--muted'
                    onClick={restartProcess}
                    disabled={loading}
                  >
                    Start over
                  </button>
                </div>
              </motion.form>
            )}

            {step === 'success' && (
              <motion.div
                key='success-step'
                className='forgot__success'
                variants={stepVariants}
                initial='initial'
                animate='animate'
                exit='exit'
              >
                <div className='forgot__success-icon' aria-hidden='true'>
                  ✓
                </div>
                <h2 className='forgot__section-title'>Pincode Updated</h2>
                <p className='forgot__helper'>
                  {success ||
                    'Your pincode has been changed. Keep it secure and do not share it with anyone.'}
                </p>
                {typeof remainingResets === 'number' && (
                  <p className='forgot__helper'>
                    {blocked
                      ? 'You have used all self-service resets for this ID.'
                      : `Self-service resets remaining: ${remainingResets}`}
                  </p>
                )}
                <div className='forgot__actions forgot__actions--success'>
                  <motion.button
                    type='button'
                    className='forgot__submit'
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/login', { replace: true })}
                  >
                    Return to login
                  </motion.button>
                  <button
                    type='button'
                    className='forgot__link forgot__link--muted'
                    onClick={restartProcess}
                  >
                    Reset another ID
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='forgot__alerts'>
            {error && <div className='forgot__alert forgot__alert--error'>{error}</div>}
            {!error && info && (
              <div className='forgot__alert forgot__alert--info'>{info}</div>
            )}
          </div>
        </motion.div>
      </motion.section>

      <MainFooter />
    </div>
  )
}

export default ForgotPin
