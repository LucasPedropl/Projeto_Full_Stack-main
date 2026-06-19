import React from 'react'
import { useIncomes } from '../contexts/IncomeContext.jsx'
import { INCOME_CATEGORIES } from '../constants.js'
import IncomeItem from './IncomeItem.jsx'
import styles from './ExpenseList.module.css'

export default function IncomeList() {
  const { incomes, isLoading } = useIncomes()

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Resultados
          {incomes.length > 0 && (
            <span className={styles.count}>{incomes.length}</span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </div>
      ) : incomes.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>💰</span>
          <p>Nenhuma receita encontrada.</p>
          <p className={styles.emptyHint}>
            Adicione uma nova receita ou ajuste os filtros de busca.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {incomes.map((income, index) => (
            <div key={income.id} style={{ animationDelay: `${index * 0.04}s` }}>
              <IncomeItem income={income} />
            </div>
          ))}
        </div>
      )}

      {incomes.length > 0 && (
        <div className={styles.legend}>
          {INCOME_CATEGORIES.filter((cat) => incomes.some((item) => item.category === cat.value)).map((cat) => (
            <span key={cat.value} className={styles.legendItem} style={{ '--cat-color': cat.color }}>
              {cat.emoji} {cat.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
