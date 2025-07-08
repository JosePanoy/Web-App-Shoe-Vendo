import React from "react";
import { motion } from "framer-motion";
import "../../assets/css/process_page/enter_gamil.css";
import MainBackImage from "../../assets/img/main-back.jpg";

function EnterGmailComponent() {
  return (
    <div
      className="enter-gmail-container"
      style={{ backgroundImage: `url(${MainBackImage})` }}
    >
      <motion.div
        className="enter-gmail-overlay"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: false, amount: 0.6 }}
      >
        <motion.h1
          className="enter-gmail-title"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Welcome to Shoenitize!
        </motion.h1>

        <motion.p
          className="enter-gmail-subtitle"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Step in, sanitize, and stride out with confidence.
        </motion.p>

        <div className="enter-gmail-box">
          <motion.label
            className="enter-gmail-label"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: false, amount: 0.6 }}
          >
            Enter your Gmail address
          </motion.label>

          <motion.input
            type="email"
            className="enter-gmail-input"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            viewport={{ once: false, amount: 0.6 }}
          />

          <motion.button
            className="enter-gmail-button"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            viewport={{ once: false, amount: 0.6 }}
          >
            Send Code
          </motion.button>
        </div>

        <motion.p
          className="enter-gmail-note"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.7 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          ⚠️ This system only works when near vending machine.
        </motion.p>
      </motion.div>

      <motion.p
        className="enter-gmail-footer"
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 2.0 }}
        viewport={{ once: false, amount: 0.6 }}
      >
        Created for WIT Athletes, by WIT Students
      </motion.p>
    </div>
  );
}

export default EnterGmailComponent;
