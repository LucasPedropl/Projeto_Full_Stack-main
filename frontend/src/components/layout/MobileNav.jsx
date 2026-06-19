import React from 'react'
import { useNavigation, NAV_ITEMS } from '../../contexts/NavigationContext.jsx'
import NavIcon from '../ui/NavIcon.jsx'
import styles from './MobileNav.module.css'

const SHORT_LABELS = {
  overview: 'Início',
  expenses: 'Lanç.',
  analytics: 'Relat.',
  budgets: 'Orçam.',
  settings: 'Conta',
}

export default function MobileNav() {
  const { currentView, navigate } = useNavigation()

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => {
        const isActive = currentView === item.id

        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            onClick={() => navigate(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.icon}>
              <NavIcon name={item.icon} size={22} />
            </span>
            <span className={styles.label}>{SHORT_LABELS[item.id] || item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
