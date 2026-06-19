import React, { useState } from 'react'
import { formatBRL, getCategoryMeta, getIncomeCategoryMeta } from '../../constants.js'
import { useCustomCategories } from '../../hooks/useCustomCategories.js'
import styles from './TransactionTable.module.css'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function TransactionTable({
  items,
  type,
  isLoading,
  onRemove,
}) {
  const [confirmId, setConfirmId] = useState(null)
  const isIncome = type === 'income'
  const { customCategories } = useCustomCategories(isIncome ? 'income' : 'expense')

  const getMeta = (category) => (
    isIncome
      ? getIncomeCategoryMeta(category, customCategories)
      : getCategoryMeta(category, customCategories)
  )

  const handleRemove = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 2500)
      return
    }
    setConfirmId(null)
    await onRemove(id)
  }

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.skeletonRows}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.skeleton} />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.empty}>
          <p>Nenhum lançamento encontrado.</p>
          <span>Ajuste a busca ou cadastre um novo lançamento.</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Data</th>
              <th className={styles.colValue}>Valor</th>
              <th className={styles.colActions} aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const meta = getMeta(item.category)
              return (
                <tr key={item.id}>
                  <td data-label="Descrição">
                    <div className={styles.colDesc}>
                      <span className={styles.emoji}>{meta.emoji}</span>
                      <span className={styles.descText}>{item.description}</span>
                    </div>
                  </td>
                  <td data-label="Categoria">
                    <span className={styles.catBadge} style={{ '--cat-color': meta.color }}>
                      {meta.label}
                    </span>
                  </td>
                  <td className={styles.colDate} data-label="Data">{formatDate(item.date)}</td>
                  <td className={`${styles.colValue} ${isIncome ? styles.income : styles.expense}`} data-label="Valor">
                    {isIncome ? '+' : '-'}{formatBRL(item.value)}
                  </td>
                  <td className={styles.colActions} data-label="Ações">
                    <button
                      type="button"
                      className={`${styles.removeBtn} ${confirmId === item.id ? styles.confirming : ''}`}
                      onClick={() => handleRemove(item.id)}
                      title={confirmId === item.id ? 'Clique novamente para confirmar' : 'Remover'}
                    >
                      {confirmId === item.id ? 'Confirmar' : 'Remover'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <footer className={styles.footer}>
        {items.length} {items.length === 1 ? 'registro' : 'registros'}
      </footer>
    </div>
  )
}
