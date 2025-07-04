import React from 'react'
import { motion } from 'framer-motion'
import "../../assets/css/Landing-Page-CSSS/main-content.css"
import MainBack from "../../assets/img/main-back.jpg"

function MainContent() {
  return (
    <div className="main-content-container">
      <img src={MainBack} alt="Background" className="main-content-background" />
      <div className="main-content-overlay-bg"></div>

      <div className="main-content-overlay">
        <motion.h1
          className="main-content-title"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Fresh Kicks,<br />Confident Kicks
        </motion.h1>

        <motion.h4
          className="main-content-subtitle"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Hygiene meets innovation for athletes who never stop moving
        </motion.h4>

        <motion.h4
          className="main-content-subtitle"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Our automated system sanitizes, deodorizes, and dries shoes quickly and effectively, specially made for WIT student-athletes.
        </motion.h4>

        <motion.button
          className="main-content-button"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Get Started →
        </motion.button>

        <motion.p
          className="main-content-note"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Tap the "Get Started" to begin your shoe sanitizing sessions.
        </motion.p>
      </div>

      <motion.h3
        className="main-content-tagline"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 2.2 }}
        viewport={{ once: false, amount: 0.6 }}
      >
        Created for WIT Athletes, by WIT Students.
      </motion.h3>
    </div>
  )
}

export default MainContent
