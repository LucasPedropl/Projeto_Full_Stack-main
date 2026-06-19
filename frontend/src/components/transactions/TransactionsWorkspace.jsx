import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useExpenses } from '../../contexts/ExpenseContext.jsx'
import { useIncomes } from '../../contexts/IncomeContext.jsx'
import { CATEGORIES, INCOME_CATEGORIES } from '../../constants.js'
import ExpenseForm from '../ExpenseForm.jsx'
import IncomeForm from '../IncomeForm.jsx'
import Modal from '../ui/Modal.jsx'
import NavIcon from '../ui/NavIcon.jsx'
import TransactionFilters from './TransactionFilters.jsx'
import TransactionTable from './TransactionTable.jsx'
import styles from './TransactionsWorkspace.module.css'

const EMPTY_FILTERS = {
  category: 'all',
  description: '',
  startDate: '',
  endDate: '',
}

export default function TransactionsWorkspace({ type }) {
  const isExpense = type === 'expense'
  const expenseCtx = useExpenses()
  const incomeCtx = useIncomes()

  const items = isExpense ? expenseCtx.expenses : incomeCtx.incomes
  const isLoading = isExpense ? expenseCtx.isLoading : incomeCtx.isLoading
  const applySearch = isExpense ? expenseCtx.applySearch : incomeCtx.applySearch
  const clearSearch = isExpense ? expenseCtx.clearSearch : incomeCtx.clearSearch
  const removeItem = isExpense ? expenseCtx.removeExpense : incomeCtx.removeIncome

  const [searchQuery, setSearchQuery] = useState('')
  const [localFilters, setLocalFilters] = useState(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const filtersRef = useRef(null)

  const categoryOptions = [
    { value: 'all', label: 'Todas as categorias' },
    ...(isExpense ? CATEGORIES : INCOME_CATEGORIES).map((cat) => ({
      value: cat.value,
      label: `${cat.emoji} ${cat.label}`,
    })),
  ]

  const runSearch = useCallback((filters) => {
    applySearch(filters)
  }, [applySearch])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const next = { ...localFilters, description: searchQuery.trim() }
    setLocalFilters(next)
    runSearch(next)
  }

  const handleFilterChange = (field, value) => {
    setLocalFilters((current) => ({ ...current, [field]: value }))
  }

  const handleApplyFilters = () => {
    const next = { ...localFilters, description: searchQuery.trim() }
    setLocalFilters(next)
    runSearch(next)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setLocalFilters(EMPTY_FILTERS)
    clearSearch()
  }

  const handleFormSuccess = () => {
    setModalOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setFiltersOpen(false)
      }
    }

    if (filtersOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [filtersOpen])

  const activeFilterCount = [
    localFilters.category !== 'all',
    localFilters.startDate,
    localFilters.endDate,
  ].filter(Boolean).length

  return (
    <div className={styles.workspace}>
      <div className={styles.toolbar}>
        <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
          <NavIcon name="search" size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={`Buscar ${isExpense ? 'despesas' : 'receitas'} por descrição...`}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className={styles.filterDropdownWrap} ref={filtersRef}>
            <button
              type="button"
              className={`${styles.filterBtn} ${filtersOpen ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-label="Abrir filtros"
            >
              <NavIcon name="filter" size={16} />
              Filtros
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
            </button>

            {filtersOpen && (
              <div className={styles.filterDropdown}>
                <TransactionFilters
                  open={filtersOpen}
                  filters={localFilters}
                  categoryOptions={categoryOptions}
                  onChange={handleFilterChange}
                  onApply={() => {
                    handleApplyFilters()
                    setFiltersOpen(false)
                  }}
                  onClear={handleClearFilters}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </form>

        <button
          type="button"
          className={`${styles.addBtn} ${isExpense ? '' : styles.addBtnIncome}`}
          onClick={() => setModalOpen(true)}
        >
          <NavIcon name="plus" size={16} />
          {isExpense ? 'Nova despesa' : 'Nova receita'}
        </button>
      </div>

      <TransactionTable
        items={items}
        type={type}
        isLoading={isLoading}
        onRemove={removeItem}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isExpense ? 'Cadastrar despesa' : 'Cadastrar receita'}
      >
        {isExpense ? (
          <ExpenseForm inModal onSuccess={handleFormSuccess} />
        ) : (
          <IncomeForm inModal onSuccess={handleFormSuccess} />
        )}
      </Modal>
    </div>
  )
}
