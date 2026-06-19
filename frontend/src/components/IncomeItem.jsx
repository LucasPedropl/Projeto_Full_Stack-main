import React, { useState } from 'react'
import { useIncomes } from '../contexts/IncomeContext.jsx'
import { getIncomeCategoryMeta } from '../constants.js'
import styles from './ExpenseItem.module.css'

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatCurrency = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function IncomeItem({ income }) {
  const { removeIncome } = useIncomes()
  const [confirming, setConfirming] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const meta = getIncomeCategoryMeta(income.category)

  const handleRemove = async () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
      return
    }

    setIsRemoving(true)
    await removeIncome(income.id)
    setIsRemoving(false)
  }

  return (
    <div className={`${styles.item} ${isRemoving ? styles.removing : ''}`} style={{ '--cat-color': meta.color }}>
      <div className={styles.catBar} />

      <div className={styles.catIcon} title={meta.label}>
        {meta.emoji}
      </div>

      <div className={styles.info}>
        <span className={styles.description}>{income.description}</span>
        <span className={styles.meta}>
          <span className={styles.catLabel} style={{ color: meta.color }}>
            {meta.label}
          </span>
          <span className={styles.dot}>·</span>
          <span className={styles.date}>{formatDate(income.date)}</span>
        </span>
      </div>

      <div className={styles.right}>
        <span className={styles.value} style={{ color: 'var(--success)' }}>
          +{formatCurrency(income.value)}
        </span>
        <button
          type="button"
          className={`${styles.removeBtn} ${confirming ? styles.confirming : ''}`}
          onClick={handleRemove}
          disabled={isRemoving}
          title={confirming ? 'Clique novamente para confirmar' : 'Remover receita'}
        >
          {isRemoving ? '…' : confirming ? '?' : '×'}
        </button>
      </div>
    </div>
  )
}
