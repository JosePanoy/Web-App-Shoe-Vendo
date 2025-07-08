import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../../assets/css/process_page/enter_email_code.css";
import MainFooter from "../resuable-components/main-footer";
import LandingPageMainNav from "../Landing-Page/main-nav";
import MainBackImg from "../../assets/img/main-back.jpg";

function EnterEmailCode() {
  const inputsRef = useRef([]);
  const [inputValues, setInputValues] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(null);
  const [showInitialResend, setShowInitialResend] = useState(true);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      setCountdown(null);
      setShowError(true);
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {
      const newValues = [...inputValues];
      newValues[index] = value;
      setInputValues(newValues);
      if (index < 5) {
        inputsRef.current[index + 1].disabled = false;
        inputsRef.current[index + 1].focus();
      }
    } else {
      e.target.value = "";
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newValues = [...inputValues];
      newValues[index] = "";
      setInputValues(newValues);
      if (!e.target.value && index > 0) {
        inputsRef.current[index].disabled = true;
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const isCodeComplete = inputValues.every((val) => val !== "");

  const handleResend = () => {
    setInputValues(["", "", "", "", "", ""]);
    inputsRef.current.forEach((input, i) => {
      if (input) {
        input.disabled = i !== 0;
        input.value = "";
      }
    });
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
    setCountdown(60);
    setShowInitialResend(false);
    setShowError(false);
  };

  return (
    <>
      <LandingPageMainNav />
      <div
        className="enter-code-container"
        style={{ backgroundImage: `url(${MainBackImg})` }}
      >
        <motion.h1
          className="enter-code-title"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Welcome to Shoenitize!
        </motion.h1>

        <motion.p
          className="enter-code-subtitle"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          Step in, sanitize, and stride out with confidence.
        </motion.p>

        <motion.div
          className="enter-code-overlay"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.6 }}
        >
          <div className="enter-code-box">
            <motion.label
              className="enter-code-label"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: false, amount: 0.6 }}
            >
              Enter your Verification Code
            </motion.label>

            <motion.label
              className="enter-code-label-confirm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: false, amount: 0.6 }}
            >
              We've sent a 6-digit verification code to your Gmail.
            </motion.label>

            <motion.div
              className="code-input-wrapper"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              viewport={{ once: false, amount: 0.6 }}
            >
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="code-input"
                  ref={(el) => (inputsRef.current[index] = el)}
                  value={inputValues[index]}
                  disabled={index !== 0 && inputValues[index - 1] === ""}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                />
              ))}
            </motion.div>

            <motion.label
              className="enter-code-label-confirm"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: false, amount: 0.6 }}
            >
              {showInitialResend ? (
                <span>
                  Didn't receive code yet?{" "}
                  <span
                    style={{ color: "yellow", cursor: "pointer" }}
                    onClick={handleResend}
                  >
                    Resend Code
                  </span>
                </span>
              ) : countdown !== null ? (
                `⌛Resend available in ${countdown}s`
              ) : showError ? (
                <span>
                  The code you entered is incorrect.{" "}
                  <span
                    style={{ color: "yellow", cursor: "pointer" }}
                    onClick={handleResend}
                  >
                    Resend Code
                  </span>
                </span>
              ) : null}
            </motion.label>

            <button
              className={`enter-code-button${!isCodeComplete ? " disabled" : ""}`}
              disabled={!isCodeComplete}
            >
              Verify
            </button>

            <motion.p
              className="enter-code-note"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.7 }}
              viewport={{ once: false, amount: 0.6 }}
            >
              ⚠️ This system only works when near vending machine.
            </motion.p>
          </div>
        </motion.div>
      </div>
      <MainFooter />
    </>
  );
}

export default EnterEmailCode;
