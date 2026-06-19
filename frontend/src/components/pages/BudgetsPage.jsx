import React, { useState } from 'react'
import { useBudgets } from '../../hooks/useBudgets.js'
import { CATEGORIES, formatBRL, getCategoryMeta } from '../../constants.js'
import SearchableSelect from '../ui/SearchableSelect.jsx'
import PageHeader from '../ui/PageHeader.jsx'
import pageStyles from '../../styles/page.module.css'
import styles from './BudgetsPage.module.css'

const CATEGORY_OPTIONS = CATEGORIES.map((cat) => ({
  value: cat.value,
  label: `${cat.emoji} ${cat.label}`,
}))

export default function BudgetsPage() {
  const { budgets, isLoading, isSaving, saveBudget, removeBudget } = useBudgets()
  const [category, setCategory] = useState('food')
  const [limit, setLimit] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const monthlyLimit = parseFloat(limit.replace(',', '.'))
    if (!monthlyLimit || monthlyLimit <= 0) return

    await saveBudget(category, monthlyLimit)
    setLimit('')
  }

  return (
    <div className={pageStyles.page}>
      <PageHeader
        title="Orçamentos"
        subtitle="Defina limites mensais por categoria e acompanhe o progresso dos seus gastos."
        badge="Limites"
      />

      <div className={styles.grid}>
        <section className={`${pageStyles.card} ${styles.formCard}`}>
          <h2>Definir limite mensal</h2>
          <p className={styles.hint}>
            Configure quanto deseja gastar por categoria. O painel exibirá o progresso em tempo real.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="budget-category">Categoria</label>
              <SearchableSelect
                id="budget-category"
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS}
                placeholder="Categoria"
                searchPlaceholder="Pesquisar categoria..."
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="budget-limit">Limite (R$)</label>
              <input
                id="budget-limit"
                type="number"
                min="0.01"
                step="0.01"
                className={styles.input}
                placeholder="500,00"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
              />
            </div>

            <button type="submit" className={styles.submit} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar orçamento'}
            </button>
          </form>
        </section>

        <section className={`${pageStyles.card} ${styles.listCard}`}>
          <h2>Orçamentos ativos</h2>

          {isLoading && <p className={styles.loading}>Carregando...</p>}

          {!isLoading && budgets.length === 0 && (
            <p className={styles.empty}>Nenhum orçamento configurado.</p>
          )}

          <ul className={styles.list}>
            {budgets.map((budget) => {
              const meta = getCategoryMeta(budget.category)
              return (
                <li key={budget.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.emoji}>{meta.emoji}</span>
                    <div>
                      <strong>{meta.label}</strong>
                      <span>{formatBRL(budget.monthly_limit)}/mês</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => removeBudget(budget.id)}
                  >
                    Remover
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
