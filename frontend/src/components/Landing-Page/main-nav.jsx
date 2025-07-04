import React from 'react'
import NotifIcon from "../../assets/icons/notification.png"
import GiftBoxIcon from "../../assets/icons/giftbox.png"
import "../../assets/css/Landing-Page-CSSS/landing-page-main-nav.css"

function LandingPageMainNav() {
  return (
    <nav className="landing-nav-container">
      <div className="landing-nav-logo">SHOENITIZE</div>
      <div className="landing-nav-icons">
        <img src={GiftBoxIcon} alt="gift" className="landing-nav-icon" />
        <img src={NotifIcon} alt="notification" className="landing-nav-icon" />
        <div className="landing-nav-divider" />
        <button className="landing-nav-btn">Notifications</button>
      </div>
    </nav>
  )
}

export default LandingPageMainNav
