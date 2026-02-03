import { useState, useCallback } from 'react'
import Toast from './Toast'
import { ToastContext } from './ToastContext'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000, variant = 'filled') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration, variant }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'info', duration = 4000, variant = 'filled') => {
    return addToast(message, type, duration, variant)
  }, [addToast])

  return (
    <ToastContext.Provider value={{ showToast, addToast, removeToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          variant={toast.variant}
          onClose={removeToast}
        />
      ))}
    </ToastContext.Provider>
  )
}
