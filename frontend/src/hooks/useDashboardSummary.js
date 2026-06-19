import { useCallback, useEffect, useState } from 'react'
import { fetchDashboardSummary } from '../services/dashboardService.js'
import { useExpenses } from '../contexts/ExpenseContext.jsx'
import { useIncomes } from '../contexts/IncomeContext.jsx'
import { useNavigation } from '../contexts/NavigationContext.jsx'

export function useDashboardSummary() {
  const { currentView } = useNavigation()
  const { dataVersion: expenseVersion } = useExpenses()
  const { dataVersion: incomeVersion } = useIncomes()
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchDashboardSummary({ refresh: true })
      setSummary(result.summary)
    } catch (err) {
      console.error('[dashboard]', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentView !== 'overview') return
    loadSummary()
  }, [currentView, expenseVersion, incomeVersion, loadSummary])

  return { summary, isLoading, error, refresh: loadSummary }
}
