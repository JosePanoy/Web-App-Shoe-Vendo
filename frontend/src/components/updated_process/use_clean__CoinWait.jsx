import React, { useState } from 'react'
import { motion } from 'framer-motion'
import '../../assets/css/updated_process/use_clean__coin-wait.css'

function UseCleanCoinWait ({ price, onBack, onReadCoin }) {
  const [waiting, setWaiting] = useState(false)

  const handleRead = async () => {
    if (waiting) return
    setWaiting(true)
    try {
      await onReadCoin()
    } finally {
      setWaiting(false)
    }
  }

  return (
    <div className='use_clean__coin'>
      <h3>Insert Coin</h3>
      <p>Required amount: ₱{price}. Activate the coin slot and insert a single coin.</p>
      <div className='use_clean__row'>
        <motion.button whileHover={{ scale: 1.02 }} className='use_clean__btn-outline' onClick={onBack} disabled={waiting}>Back</motion.button>
        <motion.button className='use_clean__btn-primary' whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} onClick={handleRead} disabled={waiting}>
          {waiting ? 'Waiting…' : 'Activate & Wait for Coin'}
        </motion.button>
      </div>
      <p className='use_clean__hint'>The slot deactivates immediately after reading one coin.</p>
    </div>
  )
}

export default UseCleanCoinWait
