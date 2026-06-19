import React, { useState } from 'react'
import { useExpenses } from '../contexts/ExpenseContext.jsx'
import { CATEGORIES } from '../constants.js'
import SearchableSelect from './ui/SearchableSelect.jsx'
import styles from './ExpenseSearch.module.css'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Todas as categorias' },
  ...CATEGORIES.map((cat) => ({
    value: cat.value,
    label: `${cat.emoji} ${cat.label}`,
  })),
]

export default function ExpenseSearch() {
  const { filters, applySearch, clearSearch, isLoading } = useExpenses()
  const [localFilters, setLocalFilters] = useState(filters)

  const handleChange = (field, value) => {
    setLocalFilters((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    applySearch(localFilters)
  }

  const handleClear = () => {
    const empty = {
      category: 'all',
      description: '',
      startDate: '',
      endDate: '',
    }
    setLocalFilters(empty)
    clearSearch()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>🔍</span>
          Busca avançada
        </h2>
        <p className={styles.hint}>Consulta realizada no servidor (requer login).</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.group}>
          <label className={styles.label} htmlFor="search-description">Descrição</label>
          <input
            id="search-description"
            className={styles.input}
            type="text"
            placeholder="Ex: almoço, uber, mercado..."
            value={localFilters.description}
            onChange={(event) => handleChange('description', event.target.value)}
          />
        </div>

        <div className={styles.row}>
          <SearchableSelect
            label="Categoria"
            value={localFilters.category}
            onChange={(value) => handleChange('category', value)}
            options={CATEGORY_OPTIONS}
            placeholder="Todas as categorias"
            searchPlaceholder="Filtrar categoria..."
          />

          <div className={styles.group}>
            <label className={styles.label} htmlFor="start-date">Data inicial</label>
            <input
              id="start-date"
              className={styles.input}
              type="date"
              value={localFilters.startDate}
              onChange={(event) => handleChange('startDate', event.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="end-date">Data final</label>
            <input
              id="end-date"
              className={styles.input}
              type="date"
              value={localFilters.endDate}
              onChange={(event) => handleChange('endDate', event.target.value)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.searchBtn} disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            Limpar filtros
          </button>
        </div>
      </form>
    </div>
  )
}
