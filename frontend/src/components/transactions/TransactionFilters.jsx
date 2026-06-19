import React from 'react'
import SearchableSelect from '../ui/SearchableSelect.jsx'
import styles from './TransactionFilters.module.css'

export default function TransactionFilters({
  open,
  filters,
  categoryOptions,
  onChange,
  onApply,
  onClear,
  isLoading,
}) {
  if (!open) return null

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Filtros avançados</h3>
        <p>Refine a busca por categoria e período.</p>
      </div>

      <div className={styles.grid}>
        <SearchableSelect
          label="Categoria"
          value={filters.category}
          onChange={(value) => onChange('category', value)}
          options={categoryOptions}
          placeholder="Todas as categorias"
          searchPlaceholder="Pesquisar categoria..."
        />

        <div className={styles.field}>
          <label htmlFor="filter-start">Data inicial</label>
          <input
            id="filter-start"
            type="date"
            className={styles.input}
            value={filters.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="filter-end">Data final</label>
          <input
            id="filter-end"
            type="date"
            className={styles.input}
            value={filters.endDate}
            onChange={(event) => onChange('endDate', event.target.value)}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.applyBtn} onClick={onApply} disabled={isLoading}>
          {isLoading ? 'Aplicando...' : 'Aplicar filtros'}
        </button>
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          Limpar
        </button>
      </div>
    </div>
  )
}
