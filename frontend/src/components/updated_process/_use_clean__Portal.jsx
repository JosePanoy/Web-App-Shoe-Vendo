import { useEffect } from 'react'
import { createPortal } from 'react-dom'

function UseCleanPortal ({ children }) {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])
  return createPortal(children, document.body)
}

export default UseCleanPortal

