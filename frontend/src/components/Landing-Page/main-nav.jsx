import React from "react";
import { Link } from "react-router-dom";
import NotifIcon from "../../assets/icons/notification.png";
import GiftBoxIcon from "../../assets/icons/giftbox.png";
import "../../assets/css/Landing-Page-CSSS/landing-page-main-nav.css";

function LandingPageMainNav() {
  return (
    <nav className="landing-nav-container">
      <Link to="/" className="landing-nav-logo">
        SHOENITIZE
      </Link>
      <div className="landing-nav-icons">
        <Link to="/gifts">
          <img src={GiftBoxIcon} alt="gift" className="landing-nav-icon" />
        </Link>

        <Link to="/updates">
          <img
            src={NotifIcon}
            alt="notification"
            className="landing-nav-icon"
          />
        </Link>

        <div className="landing-nav-divider" />
        <Link to="/notification "button className="landing-nav-btn">Notifications</Link>
      </div>
    </nav>
  );
}

export default LandingPageMainNav;
