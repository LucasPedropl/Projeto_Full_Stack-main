import React from 'react'
import styles from './LoadingScreen.module.css'

export default function LoadingScreen() {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <span className={styles.logo}>◈</span>
        <div className={styles.spinner} />
        <p>Carregando GastôMeter...</p>
      </div>
    </div>
  )
}
