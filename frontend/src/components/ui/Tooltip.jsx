import React, { useState } from 'react'
import styles from './Tooltip.module.css'

export default function Tooltip({ label, description, children, disabled = false }) {
  const [visible, setVisible] = useState(false)

  if (disabled) {
    return children
  }

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={styles.tooltip} role="tooltip">
          <strong>{label}</strong>
          {description && <small>{description}</small>}
        </span>
      )}
    </span>
  )
}
