import React from 'react'
import { useBudgets } from '../../hooks/useBudgets.js'
import { useDashboardSummary } from '../../hooks/useDashboardSummary.js'
import { formatBRL, getCategoryMeta, getIncomeCategoryMeta } from '../../constants.js'
import PageHeader from '../ui/PageHeader.jsx'
import StatsGrid from '../layout/StatsGrid.jsx'
import pageStyles from '../../styles/page.module.css'
import styles from './OverviewPage.module.css'

export default function OverviewPage() {
  const { summary, isLoading } = useDashboardSummary()
  const { budgets } = useBudgets()

  const spendingByCategory = summary?.byCategory || []
  const recentExpenses = summary?.recentExpenses || []
  const recentIncomes = summary?.recentIncomes || []

  const recentAll = [
    ...recentExpenses.map((item) => ({ ...item, type: 'expense' })),
    ...recentIncomes.map((item) => ({ ...item, type: 'income' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)

  return (
    <div className={pageStyles.page}>
      <PageHeader
        title="Visão Geral"
        subtitle="Acompanhe saldo, receitas, despesas e orçamentos do mês em um só lugar."
        badge="Dashboard"
      />

      <StatsGrid summary={summary} isLoading={isLoading} />

      <div className={pageStyles.grid2}>
        <section className={`${pageStyles.card} ${styles.card}`}>
          <div className={styles.cardHeader}>
            <h2>Últimos lançamentos</h2>
            {isLoading && <span className={styles.loading}>Atualizando...</span>}
          </div>

          {!isLoading && recentAll.length === 0 && (
            <p className={styles.empty}>Nenhum lançamento registrado ainda.</p>
          )}

          <ul className={styles.recentList}>
            {recentAll.map((item) => {
              const isIncome = item.type === 'income'
              const meta = isIncome
                ? getIncomeCategoryMeta(item.category)
                : getCategoryMeta(item.category)

              return (
                <li key={`${item.type}-${item.id}`} className={styles.recentItem}>
                  <span className={styles.emoji}>{meta.emoji}</span>
                  <div className={styles.recentInfo}>
                    <strong>{item.description}</strong>
                    <span>{item.date}</span>
                  </div>
                  <span className={`${styles.recentValue} ${isIncome ? styles.incomeValue : styles.expenseValue}`}>
                    {isIncome ? '+' : '-'}{formatBRL(item.value)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className={`${pageStyles.card} ${styles.card}`}>
          <div className={styles.cardHeader}>
            <h2>Orçamentos do mês</h2>
          </div>

          {budgets.length === 0 && (
            <p className={styles.empty}>
              Defina limites na aba Orçamentos para acompanhar o progresso.
            </p>
          )}

          <ul className={styles.budgetList}>
            {budgets.map((budget) => {
              const meta = getCategoryMeta(budget.category)
              const spent = spendingByCategory.find((item) => item.category === budget.category)
              const spentValue = spent?.total || 0
              const limit = Number(budget.monthly_limit)
              const percentage = limit > 0 ? Math.min(100, (spentValue / limit) * 100) : 0
              const isOver = spentValue > limit

              return (
                <li key={budget.id} className={styles.budgetItem}>
                  <div className={styles.budgetTop}>
                    <span>{meta.emoji} {meta.label}</span>
                    <span className={isOver ? styles.overBudget : ''}>
                      {formatBRL(spentValue)} / {formatBRL(limit)}
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${isOver ? styles.barOver : ''}`}
                      style={{ width: `${percentage}%`, background: isOver ? 'var(--danger)' : meta.color }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
