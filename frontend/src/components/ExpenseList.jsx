import React from 'react'
import { useExpenses } from '../contexts/ExpenseContext.jsx'
import { CATEGORIES } from '../constants.js'
import ExpenseItem from './ExpenseItem.jsx'
import styles from './ExpenseList.module.css'

export default function ExpenseList() {
  const { expenses, isLoading } = useExpenses()

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Resultados
          {expenses.length > 0 && (
            <span className={styles.count}>{expenses.length}</span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p>Nenhum gasto encontrado.</p>
          <p className={styles.emptyHint}>
            Adicione um novo gasto ou ajuste os filtros de busca.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {expenses.map((expense, index) => (
            <div key={expense.id} style={{ animationDelay: `${index * 0.04}s` }}>
              <ExpenseItem expense={expense} />
            </div>
          ))}
        </div>
      )}

      {expenses.length > 0 && (
        <div className={styles.legend}>
          {CATEGORIES.filter((cat) => expenses.some((item) => item.category === cat.value)).map((cat) => (
            <span key={cat.value} className={styles.legendItem} style={{ '--cat-color': cat.color }}>
              {cat.emoji} {cat.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
