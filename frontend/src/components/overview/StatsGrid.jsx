import React from 'react'
import { formatBRL } from '../../constants.js'
import styles from './StatsGrid.module.css'

const CARDS = [
  { key: 'monthIncome', label: 'Receitas do mês', icon: '↑', isIncome: true },
  { key: 'monthTotal', label: 'Despesas do mês', icon: '↓', isExpense: true },
  { key: 'monthBalance', label: 'Saldo do mês', icon: '⚖', isBalance: true },
  { key: 'monthCount', label: 'Lançamentos', icon: '📊', isCount: true },
]

export default function StatsGrid({ summary, isLoading }) {
  const values = {
    monthIncome: summary?.monthIncome ?? 0,
    monthTotal: summary?.monthTotal ?? 0,
    monthBalance: summary?.monthBalance ?? 0,
    monthCount: (summary?.monthCount ?? 0) + (summary?.monthIncomeCount ?? 0),
    totalBalance: summary?.totalBalance ?? 0,
  }

  const balanceClass = values.monthBalance >= 0 ? styles.positive : styles.negative

  return (
    <section className={styles.grid}>
      <article className={`${styles.card} ${styles.highlight}`}>
        <span className={styles.icon}>💰</span>
        <div>
          <p className={styles.label}>Saldo geral</p>
          <p className={`${styles.value} ${values.totalBalance >= 0 ? styles.positive : styles.negative}`}>
            {isLoading ? '...' : formatBRL(values.totalBalance)}
          </p>
        </div>
      </article>

      {CARDS.map((card) => (
        <article key={card.key} className={styles.card}>
          <span className={styles.icon}>{card.icon}</span>
          <div>
            <p className={styles.label}>{card.label}</p>
            <p className={`${styles.value} ${card.isBalance ? balanceClass : ''} ${card.isIncome ? styles.positive : ''} ${card.isExpense ? styles.negative : ''}`}>
              {isLoading
                ? '...'
                : card.isCount
                  ? values[card.key]
                  : formatBRL(values[card.key])}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
