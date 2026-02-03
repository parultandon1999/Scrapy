import { useContext } from 'react'
import { ToastContext } from './ToastContext'

/**
 * useToast Hook
 * 
 * Hook to show toast notifications from anywhere in the app.
 * 
 * @returns {object} Toast functions
 * @returns {function} showToast - Show a toast notification
 * 
 * @example
 * const { showToast } = useToast()
 * showToast('Success!', 'success')
 * showToast('Error occurred', 'error')
 * showToast('Warning message', 'warning')
 * showToast('Info message', 'info')
 */

export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  
  return context
}
