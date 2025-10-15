import React, { useEffect, useState } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import { HiOutlineMenu } from 'react-icons/hi'
import LogoutBtn from './sub-components/logout-btn'
import AdminWelcome from './sub-components/admin-welcome'
import '../../assets/css/admin-side/admin-main-dashboard.css'
import ShoenitizeLogo from '../../assets/img/shoenitize.png'

function AdminMainDashboard () {
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth > 768)
  const [adminFname, setAdminFname] = useState('')
  const [adminLname, setAdminLname] = useState('')
  const [adminRole, setAdminRole] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/')
      return
    }

    const fname = localStorage.getItem('adminFname') || ''
    const lname = localStorage.getItem('adminLname') || ''
    const role = localStorage.getItem('adminRole') || ''

    setAdminFname(fname)
    setAdminLname(lname)
    setAdminRole(role)

    const modalShown = sessionStorage.getItem('adminWelcomeShown')
    if (!modalShown) {
      setShowWelcome(true)
      sessionStorage.setItem('adminWelcomeShown', 'true')
      setTimeout(() => setShowWelcome(false), 3500)
    }

    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      setSidebarVisible(!mobile)
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate])

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible)
  const closeSidebar = () => setSidebarVisible(false)

  return (
    <>
      {showWelcome && <AdminWelcome adminName={adminFname || 'Admin'} />}
      <div className='admin-dashboard__container'>
        {sidebarVisible && (
          <div
            className={`admin-dashboard__sidebar ${isMobile ? 'mobile' : ''}`}
          >
            {isMobile && (
              <button
                className='admin-dashboard__close-btn'
                onClick={closeSidebar}
              >
                &times;
              </button>
            )}
            <div className='sidebar-top'>
              <div className='admin-dashboard__logo-container'>
                <img
                  src={ShoenitizeLogo}
                  alt='Shoenitize Logo'
                  className='admin-dashboard__logo'
                />
              </div>
              <p className='admin-dashboard__menu-title'>Menu</p>
              <ul>
                <li>Dashboard</li>
                <li>Settings</li>
                <li>Profile</li>
              </ul>
            </div>
            <div className='sidebar-bottom'>
              <LogoutBtn />
            </div>
          </div>
        )}

        <div className='admin-dashboard__main'>
          <nav className='admin-main-navbar'>
            <div className='navbar-left'>
              {isMobile && (
                <button
                  className='admin-dashboard__toggle-btn'
                  onClick={toggleSidebar}
                >
                  <HiOutlineMenu size={24} />
                </button>
              )}
              <div className='navbar-title'>
                <h3>Dashboard</h3>
                <p>Overview</p>
              </div>
            </div>
            <div className='navbar-right'>
              <div className='user-box'>
                <img
                  src={ShoenitizeLogo}
                  alt='User Logo'
                  className='user-logo'
                />
                <div className='user-info'>
                  <span className='user-name'>
                    {adminFname} {adminLname}
                  </span>
                  <span className='user-role'>{adminRole}</span>
                </div>
              </div>
            </div>
          </nav>

          <div className='admin-dashboard__content'>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminMainDashboard
