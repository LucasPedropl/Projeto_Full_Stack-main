import React, { useState } from 'react'
import TransactionsWorkspace from '../transactions/TransactionsWorkspace.jsx'
import PageHeader from '../ui/PageHeader.jsx'
import pageStyles from '../../styles/page.module.css'
import styles from './ExpensesPage.module.css'

const TABS = [
  { id: 'expenses', label: 'Despesas', icon: '↓' },
  { id: 'incomes', label: 'Receitas', icon: '↑' },
]

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('expenses')

  return (
    <div className={pageStyles.page}>
      <PageHeader
        title="Lançamentos"
        subtitle="Gerencie despesas e receitas com busca, filtros e cadastro rápido."
        badge={activeTab === 'expenses' ? 'Saídas' : 'Entradas'}
      />

      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''} ${tab.id === 'incomes' ? styles.tabIncome : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <TransactionsWorkspace type={activeTab === 'expenses' ? 'expense' : 'income'} />
    </div>
  )
}
