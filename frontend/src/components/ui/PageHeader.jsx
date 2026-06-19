import React from 'react'
import styles from './PageHeader.module.css'

export default function PageHeader({ title, subtitle, badge }) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {badge && <span className={styles.badge}>{badge}</span>}
    </header>
  )
}
