import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../../assets/css/updated_process/use_clean__package-select.css'

const PACKAGES = [
  { key: 'standard', title: 'Standard Sanitize', desc: 'Best for regular use', price: 10, durationSec: 60 },
  { key: 'deep', title: 'Deep Sanitize', desc: 'Ideal after intense activity', price: 20, durationSec: 180 }
]

function Card ({ title, desc, price, durationSec, onClick }) {
  return (
    <motion.button className='use_clean__pkg-card' whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} onClick={onClick}>
      <div className='use_clean__pkg-title'>{title}</div>
      <div className='use_clean__pkg-desc'>{desc}</div>
      <div className='use_clean__pkg-price'>₱ {price}</div>
      <div className='use_clean__pkg-time'>Estimated time: {Math.round(durationSec/60)} minutes</div>
    </motion.button>
  )
}

function UseCleanPackageSelect ({ voucherCount, onSelect, onBack }) {
  return (
    <div className='use_clean__pkg-select'>
      <div className='use_clean__pkg-head'>
        <h3>Select your sanitize package</h3>
        <p>Vouchers available: {voucherCount}</p>
      </div>
      <div className='use_clean__pkg-grid'>
        {PACKAGES.map(p => (
          <Card
            key={p.key}
            title={p.title}
            desc={p.desc}
            price={p.price}
            durationSec={p.durationSec}
            onClick={() => onSelect({ type: p.key, price: p.price, durationSec: p.durationSec })}
          />
        ))}
      </div>
      <div className='use_clean__row'>
        <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-outline' onClick={onBack}>Back</motion.button>
      </div>
    </div>
  )
}

function Confirm ({ selected, voucherCount, onUseVoucher, onProceed, onBack }) {
  const [open, setOpen] = useState(true)
  const canUseVoucher = voucherCount > 0
  if (!selected) return null
  return (
    <AnimatePresence>
      {open && (
        <motion.div className='use_clean__pkg-confirm' initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
          <h3>Confirm Selection</h3>
          <p>
            {selected.type === 'deep' ? 'Deep Sanitize' : 'Standard Sanitize'} · Price: ₱{selected.price} · Time: {Math.round(selected.durationSec/60)} minute(s)
          </p>
          <div className='use_clean__row'>
            <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-outline' onClick={() => { setOpen(false); onBack() }}>Back</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-primary' onClick={() => { setOpen(false); onProceed() }}>Proceed</motion.button>
          </div>
          {canUseVoucher && (
            <div className='use_clean__voucher-line'>
              <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-ghost' onClick={() => { setOpen(false); onUseVoucher() }}>Use voucher instead (Free)</motion.button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

UseCleanPackageSelect.Confirm = Confirm

export default UseCleanPackageSelect
