import React, { useState } from 'react'
import { useExpenses } from '../contexts/ExpenseContext.jsx'
import { getCategoryMeta } from '../constants.js'
import styles from './ExpenseItem.module.css'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatCurrency = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ExpenseItem({ expense }) {
  const { removeExpense } = useExpenses()
  const [confirming, setConfirming] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const meta = getCategoryMeta(expense.category)

  const handleRemove = async () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
      return
    }

    setIsRemoving(true)
    await removeExpense(expense.id)
    setIsRemoving(false)
  }

  return (
    <div className={`${styles.item} ${isRemoving ? styles.removing : ''}`} style={{ '--cat-color': meta.color }}>
      <div className={styles.catBar} />

      <div className={styles.catIcon} title={meta.label}>
        {meta.emoji}
      </div>

      <div className={styles.info}>
        <span className={styles.description}>{expense.description}</span>
        <span className={styles.meta}>
          <span className={styles.catLabel} style={{ color: meta.color }}>
            {meta.label}
          </span>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>{formatDate(expense.date)}</span>
        </span>
      </div>

      <div className={styles.right}>
        <span className={styles.value}>{formatCurrency(expense.value)}</span>
        <button
          type="button"
          className={`${styles.removeBtn} ${confirming ? styles.confirming : ''}`}
          onClick={handleRemove}
          disabled={isRemoving}
          title={confirming ? 'Clique novamente para confirmar' : 'Remover gasto'}
        >
          {isRemoving ? '…' : confirming ? '?' : '×'}
        </button>
      </div>
    </div>
  )
}
