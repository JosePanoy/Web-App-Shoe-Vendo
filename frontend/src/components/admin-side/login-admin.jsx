import React, { useState, useRef, useEffect } from 'react'
import '../../assets/css/admin-side/admin-login.css'
import MainFooter from '../resuable-components/main-footer'
import LandingPageMainNav from '../Landing-Page/main-nav'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '')
import WitLogo from '../../assets/icons/WIT-Logo.png'

function LoginAdmin () {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showNotice, setShowNotice] = useState(true)
  const [agree, setAgree] = useState(false)
  const timeoutRef = useRef(null)
  const inputsRef = useRef([])
  const navigate = useNavigate()

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      setTimeout(() => {
        inputsRef.current[index + 1]?.focus()
      }, 10)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus()
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setShowPassword(false)
    }, 3500)
  }

  const handleLogin = async () => {
    const pincodeStr = code.join('')
    if (pincodeStr.length !== 6 || !password) {
      alert('Please enter complete pincode and password')
      return
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        pincode: pincodeStr,
        password,
        role: 'admin'
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('adminFname', res.data.fname)
      localStorage.setItem('adminLname', res.data.lname)
      localStorage.setItem('adminRole', res.data.role)

      localStorage.setItem('token', res.data.token)
      navigate('/admin')
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  useEffect(() => {
    inputsRef.current[0]?.focus()
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <>
      {showNotice && (
        <div className='admin-notice__overlay'>
          <div className='admin-notice__modal'>
            <img src={WitLogo} alt='WIT Logo' className='admin-notice__logo' />
            <h3 className='admin-notice__title'>Restricted Access</h3>
            <p className='admin-notice__text'>
              Access to this section is strictly restricted to authorized
              personnel only. This portal is intended exclusively for verified
              developers and system administrators. Any form of unauthorized
              access or attempt to bypass security protocols is strictly
              prohibited and may result in administrative or legal consequences.
            </p>
            <label className='admin-notice__checkbox'>
              <input
                type='checkbox'
                checked={agree}
                onChange={() => setAgree(!agree)}
              />
              <span>I understand and agree</span>
            </label>
            <button
              className='admin-notice__proceed'
              onClick={() => setShowNotice(false)}
              disabled={!agree}
            >
              Proceed
            </button>
            <Link to='/' className='admin-notice__home-link'>
              Go to Homepage
            </Link>
          </div>
        </div>
      )}

      <div className='admin-login__layout'>
        <LandingPageMainNav />
        <div className='admin-login admin-login__content'>
          <form
            className='admin-login__container'
            onSubmit={e => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <h2 className='admin-login__title'>Admin Login</h2>
            <div className='admin-login__code-group'>
              {code.map((num, idx) => {
                const isDisabled = idx > 0 && code[idx - 1] === ''
                return (
                  <input
                    key={idx}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={num}
                    onChange={e => handleCodeChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    ref={el => (inputsRef.current[idx] = el)}
                    className={`admin-login__code-input ${
                      !isDisabled && code[idx] === '' ? 'active' : ''
                    }`}
                    disabled={isDisabled}
                  />
                )
              })}
            </div>
            <div className='admin-login__password-group'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='Enter admin password'
                className='admin-login__password-input'
              />
              <button
                type='button'
                onClick={handleTogglePassword}
                className='admin-login__eye-button'
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className='admin-login__submit-button' type='submit'>
              Login
            </button>
          </form>
        </div>
        <MainFooter />
      </div>
    </>
  )
}

export default LoginAdmin
