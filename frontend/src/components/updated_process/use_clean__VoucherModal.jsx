import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../../assets/css/updated_process/use_clean__voucher-modal.css'
import UseCleanPortal from './_use_clean__Portal'

function UseCleanVoucherModal ({ open, vouchers = 0, stamps = 0, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <UseCleanPortal>
          <motion.div className='use_clean__modal-backdrop' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className='use_clean__modal' initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h3 className='use_clean__modal-title'>Cleaning Complete</h3>
              <p className='use_clean__modal-text'>Your shoes are sanitized. Thank you!</p>
              <div className='use_clean__voucher-summary'>
                <div>
                  <span>Free Clean Vouchers</span>
                  <strong>{vouchers}</strong>
                </div>
                <div>
                  <span>Stamps to next free</span>
                  <strong>{Math.max(0, 6 - (stamps || 0))}</strong>
                </div>
              </div>
              <div className='use_clean__modal-actions'>
                <button className='use_clean__btn-primary' onClick={onClose}>Done</button>
              </div>
            </motion.div>
          </motion.div>
        </UseCleanPortal>
      )}
    </AnimatePresence>
  )
}

export default UseCleanVoucherModal
