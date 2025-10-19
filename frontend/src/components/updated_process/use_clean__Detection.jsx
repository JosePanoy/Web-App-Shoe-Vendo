import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../../assets/css/updated_process/use_clean__detection.css'
import UseCleanPortal from './_use_clean__Portal'

function ReminderList () {
  const items = [
    'Shoes only',
    'No slippers, bags, or other items',
    'Do not insert damaged, rusty, or wrong coins',
    'Do not insert muddy, wet, or very dirty shoes',
    'Do not open the machine while running'
  ]
  return (
    <ul className='use_clean__reminders'>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

function Checking () {
  return (
    <div className='use_clean__checking'>
      <div className='use_clean__spinner' />
      <p>Checking for shoes… please wait</p>
    </div>
  )
}

function NoShoes ({ imageUrl, onRetry, onCancel }) {
  return (
    <motion.div className='use_clean__no-shoes' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3>No shoes detected</h3>
      <p>Please insert shoes properly and try again.</p>
      {imageUrl ? (
        <img className='use_clean__camera-preview' src={imageUrl} alt='Camera preview' />
      ) : null}
      <div className='use_clean__row'>
        <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-outline' onClick={onCancel}>Cancel</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-primary' onClick={onRetry}>Retry</motion.button>
      </div>
    </motion.div>
  )
}

function Detected ({ imageUrl, onProceed, onCancel }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className='use_clean__detected'>
      <h3>Shoes detected successfully! Please review the reminders before proceeding.</h3>
      {imageUrl ? (
        <img className='use_clean__camera-preview' src={imageUrl} alt='Camera preview' />
      ) : null}
      <ReminderList />
      <div className='use_clean__row'>
        <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-outline' onClick={onCancel}>Cancel</motion.button>
        <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-primary' onClick={() => setConfirm(true)}>Proceed</motion.button>
      </div>

      <AnimatePresence>
        {confirm && (
          <UseCleanPortal>
            <motion.div className='use_clean__modal-backdrop' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className='use_clean__modal' initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <h4 className='use_clean__modal-title'>Proceed to package selection?</h4>
                <p className='use_clean__modal-text'>Ensure the door is closed and items meet the reminders.</p>
                <div className='use_clean__modal-actions'>
                  <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-outline' onClick={() => setConfirm(false)}>Review</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-primary' onClick={() => { setConfirm(false); onProceed() }}>Yes, continue</motion.button>
                </div>
              </motion.div>
            </motion.div>
          </UseCleanPortal>
        )}
      </AnimatePresence>
    </div>
  )
}

function ConfirmStart ({ selected, hasVoucher, onBack, onStart }) {
  const [open, setOpen] = useState(true)
  if (!selected) return null
  return (
    <AnimatePresence>
      {open && (
        <motion.div className='use_clean__confirm-start' initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
          <h3>Start {selected.type === 'deep' ? 'Deep' : 'Standard'} Sanitize?</h3>
          <p>Price: {selected.price === 0 ? 'Free (voucher)' : `₱${selected.price}`} · Estimated time: {Math.round((selected.durationSec||60)/60)} minute(s)</p>
          <div className='use_clean__row'>
            <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-outline' onClick={onBack}>Back</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-primary' onClick={() => { setOpen(false); onStart() }}>Start</motion.button>
          </div>
          {hasVoucher && selected.price === 0 ? (
            <p className='use_clean__hint'>Voucher will be redeemed now.</p>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default { Checking, NoShoes, Detected, ConfirmStart }
