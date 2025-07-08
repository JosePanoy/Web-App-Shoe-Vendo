import React from "react";
import { motion } from "framer-motion";
import "../../assets/css/resuable-components/main-footer.css";
import FBLogo from "../../assets/icons/facebook.png";
import InstagramLogo from "../../assets/icons/instagram.png";
import WitLogo from "../../assets/icons/WIT-Logo.png";

function MainFooter() {
  return (
    <motion.footer
      className="main-footer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      viewport={{ once: false, amount: 0.6 }}
    >
      <div className="main-footer__left">
        <motion.img
          src={WitLogo}
          alt="WIT Logo"
          className="main-footer__wit-icon"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: false, amount: 0.6 }}
        />

        <motion.span
          className="main-footer__text"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Shoe Vendo by BSIT Students (2025–2026)
        </motion.span>

      </div>
      <div className="main-footer__right">
        <motion.img
          src={FBLogo}
          alt="Facebook"
          className="main-footer__icon"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: false, amount: 0.6 }}
        />

        <motion.img
          src={InstagramLogo}
          alt="Instagram"
          className="main-footer__icon"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: false, amount: 0.6 }}
        />
      </div>

    </motion.footer>
  );
}

export default MainFooter;
