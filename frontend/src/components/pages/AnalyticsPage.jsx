import React from 'react'
import Summary from '../Summary.jsx'
import PageHeader from '../ui/PageHeader.jsx'
import pageStyles from '../../styles/page.module.css'
import styles from './AnalyticsPage.module.css'

export default function AnalyticsPage() {
  return (
    <div className={pageStyles.page}>
      <PageHeader
        title="Relatórios financeiros"
        subtitle="Analise despesas por categoria, compare receitas e converta valores para outras moedas em tempo real."
        badge="Analytics"
      />

      <section className={`${pageStyles.card} ${styles.summaryWrap}`}>
        <Summary />
      </section>
    </div>
  )
}
