import { useCallback, useEffect, useState } from 'react'
import { fetchBudgets, upsertBudget, deleteBudget } from '../services/budgetService.js'
import { useToast } from '../contexts/ToastContext.jsx'

export function useBudgets() {
  const { toast } = useToast()
  const [budgets, setBudgets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadBudgets = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await fetchBudgets()
      setBudgets(data)
    } catch (error) {
      console.error('[budgets]', error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const saveBudget = useCallback(async (category, monthlyLimit) => {
    setIsSaving(true)

    try {
      const saved = await upsertBudget(category, monthlyLimit)
      setBudgets((current) => {
        const exists = current.some((item) => item.category === saved.category)
        if (exists) {
          return current.map((item) =>
            item.category === saved.category ? saved : item,
          )
        }
        return [...current, saved].sort((a, b) => a.category.localeCompare(b.category))
      })
      toast.success('Orçamento salvo!')
      return saved
    } catch (error) {
      console.error('[budgets/save]', error)
      toast.error(error.message)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [toast])

  const removeBudget = useCallback(async (id) => {
    try {
      await deleteBudget(id)
      setBudgets((current) => current.filter((item) => item.id !== id))
      toast.success('Orçamento removido.')
    } catch (error) {
      console.error('[budgets/delete]', error)
      toast.error(error.message)
    }
  }, [toast])

  return {
    budgets,
    isLoading,
    isSaving,
    loadBudgets,
    saveBudget,
    removeBudget,
  }
}
