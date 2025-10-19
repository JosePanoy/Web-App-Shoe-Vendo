import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../../assets/css/updated_process/use_clean__start.css'
import UseCleanPortal from './_use_clean__Portal'

function UseCleanStart ({ voucherCount, stampCount, onInitiate }) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className='use_clean__start'>
      <div className='use_clean__start-head'>
        <h2>Initiate Cleaning</h2>
        <p>Start a sanitizing cycle for your shoes.</p>
      </div>

      <div className='use_clean__perks'>
        <div className='use_clean__perk-card'>
          <span className='use_clean__perk-title'>Free Clean Vouchers</span>
          <strong className='use_clean__perk-count'>{voucherCount}</strong>
        </div>
        <div className='use_clean__perk-card'>
          <span className='use_clean__perk-title'>Stamps to next free</span>
          <strong className='use_clean__perk-count'>{Math.max(0, 6 - (stampCount || 0))}</strong>
        </div>
      </div>

      <motion.button
        type='button'
        className='use_clean__btn-primary'
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setConfirmOpen(true)}
      >
        Initiate Cleaning
      </motion.button>

      <AnimatePresence>
        {confirmOpen && (
          <UseCleanPortal>
            <motion.div
              className='use_clean__modal-backdrop'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className='use_clean__modal'
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className='use_clean__modal-title'>Start Cleaning?</h3>
                <p className='use_clean__modal-text'>
                  Please confirm you want to start the cleaning process.
                </p>
                <div className='use_clean__modal-actions'>
                  <motion.button
                    type='button'
                    className='use_clean__btn-outline'
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setConfirmOpen(false)}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type='button'
                    className='use_clean__btn-primary'
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setConfirmOpen(false)
                      onInitiate()
                    }}
                  >
                    Proceed
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </UseCleanPortal>
        )}
      </AnimatePresence>
    </div>
  )
}

UseCleanStart.AskInserted = function AskInserted ({ onCancel, onConfirm }) {
  const [open, setOpen] = useState(true)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className='use_clean__ask-inserted'
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
        >
          <h3>Are the shoes already inside the machine?</h3>
          <p>Please insert shoes in the chamber, then confirm.</p>
          <div className='use_clean__row'>
            <button className='use_clean__btn-outline' onClick={() => { setOpen(false); onCancel() }}>Not yet</button>
            <button className='use_clean__btn-primary' onClick={() => { setOpen(false); onConfirm() }}>Yes, check now</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UseCleanStart
