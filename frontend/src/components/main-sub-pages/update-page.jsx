import React from 'react';
import { motion } from "framer-motion";
import LandingPageMainNav from "../Landing-Page/main-nav";
import MainFooter from "../resuable-components/main-footer";
import "../../assets/css/main-sub-pages/update-page.css";

function UpdatePage() {
  return (
    <>
      <LandingPageMainNav />
      <div className="update-page__container">
        <motion.div
          className="update-page__message"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          ⚠️ This page is currently under development. Some features may not be fully functional at this time.
        </motion.div>
      </div>
      <MainFooter />
    </>
  );
}

export default UpdatePage;
