import React from "react";
import "../../../assets/css/admin-side/sub-component/AdminWelcome.css";

const AdminWelcome = ({ adminName }) => (
  <div className="admin-welcome-overlay">
    <div className="admin-welcome-modal">
      <div className="admin-welcome-header">
        <svg className="admin-welcome-icon" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="#3498db"/>
          <path d="M24 14L34 34H14L24 14Z" fill="#fff"/>
        </svg>
        <h2>Welcome, <span className="admin-welcome-name">{adminName}</span>!</h2>
      </div>
      <div className="admin-welcome-body">
        <p>Welcome to <span className="admin-welcome-app">Vendo Web App Dashboard</span>.</p>
        <p className="admin-welcome-desc">Empowering your shoe business with modern technology.</p>
      </div>
    </div>
  </div>
);

export default AdminWelcome;
