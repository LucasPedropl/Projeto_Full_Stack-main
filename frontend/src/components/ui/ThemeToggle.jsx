import React from 'react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import NavIcon from './NavIcon.jsx'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`${styles.toggle} ${compact ? styles.compact : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
    >
      <NavIcon name={isDark ? 'sun' : 'moon'} size={compact ? 16 : 18} />
      {!compact && (
        <span>{isDark ? 'Claro' : 'Escuro'}</span>
      )}
    </button>
  )
}
