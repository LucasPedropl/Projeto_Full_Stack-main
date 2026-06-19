import React from 'react'
import { useToast } from '../../contexts/ToastContext.jsx'
import styles from './ToastContainer.module.css'

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (!toasts.length) return null

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span className={styles.icon}>{ICONS[toast.type]}</span>
          <p className={styles.message}>{toast.message}</p>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismissToast(toast.id)}
            aria-label="Fechar notificação"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
