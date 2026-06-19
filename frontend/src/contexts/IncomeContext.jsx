import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  createIncome,
  deleteIncome,
  fetchIncomes,
} from '../services/incomeService.js'
import { useToast } from './ToastContext.jsx'

const IncomeContext = createContext(null)

const EMPTY_FILTERS = {
  category: 'all',
  description: '',
  startDate: '',
  endDate: '',
}

export function IncomeProvider({ children }) {
  const { toast } = useToast()
  const [incomes, setIncomes] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)

  const loadIncomes = useCallback(async (searchFilters) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchIncomes(searchFilters)
      setIncomes(result.incomes)
    } catch (err) {
      console.error('[incomes]', err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadIncomes(EMPTY_FILTERS)
  }, [loadIncomes])

  const applySearch = useCallback(async (nextFilters) => {
    setFilters(nextFilters)
    await loadIncomes(nextFilters)
  }, [loadIncomes])

  const clearSearch = useCallback(async () => {
    setFilters(EMPTY_FILTERS)
    await loadIncomes(EMPTY_FILTERS)
  }, [loadIncomes])

  const addIncome = useCallback(async (income) => {
    setIsSubmitting(true)

    try {
      const created = await createIncome(income)
      await loadIncomes(filters)
      setDataVersion((v) => v + 1)
      toast.success('Receita adicionada com sucesso!')
      return created
    } catch (err) {
      console.error('[incomes/create]', err)
      const message = err.errors?.length
        ? err.errors.join(' · ')
        : err.message
      toast.error(message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [toast, loadIncomes, filters])

  const removeIncome = useCallback(async (id) => {
    try {
      await deleteIncome(id)
      await loadIncomes(filters)
      setDataVersion((v) => v + 1)
      toast.success('Receita removida.')
    } catch (err) {
      console.error('[incomes/delete]', err)
      toast.error(err.message)
    }
  }, [toast, loadIncomes, filters])

  const totalGeneral = useMemo(
    () => incomes.reduce((sum, item) => sum + Number(item.value), 0),
    [incomes],
  )

  const stats = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const monthIncomes = incomes.filter((item) => {
      const date = new Date(`${item.date}T00:00:00`)
      return date.getMonth() === month && date.getFullYear() === year
    })

    return {
      monthTotal: monthIncomes.reduce((sum, item) => sum + item.value, 0),
      monthCount: monthIncomes.length,
    }
  }, [incomes])

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        filters,
        isLoading,
        isSubmitting,
        error,
        dataVersion,
        totalGeneral,
        stats,
        addIncome,
        removeIncome,
        applySearch,
        clearSearch,
        refreshIncomes: () => loadIncomes(filters),
      }}
    >
      {children}
    </IncomeContext.Provider>
  )
}

export function useIncomes() {
  const context = useContext(IncomeContext)
  if (!context) {
    throw new Error('useIncomes deve ser usado dentro de IncomeProvider')
  }
  return context
}
