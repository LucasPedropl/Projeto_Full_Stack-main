import { Router } from 'express'
import { Expense } from '../models/Expense.js'
import { Income } from '../models/Income.js'
import { authMiddleware } from '../config/auth.js'
import cache from '../config/cache.js'
import { logSecurityEvent } from '../config/logger.js'

const router = Router()

router.get('/summary', authMiddleware, async (req, res) => {
  const cacheKey = `dashboard:${req.user.id}`
  const skipCache = req.query.refresh === '1'

  try {
    if (!skipCache) {
      const cached = cache.get(cacheKey)

      if (cached) {
        return res.json({ data: cached, cached: true })
      }
    }

    const [expenses, incomes] = await Promise.all([
      Expense.getDashboardSummary(req.user.id),
      Income.getDashboardSummary(req.user.id),
    ])

    const summary = {
      ...expenses,
      ...incomes,
      monthBalance: incomes.monthIncome - expenses.monthTotal,
      totalBalance: incomes.totalIncome - expenses.totalGeneral,
    }

    cache.set(cacheKey, summary, 60)

    logSecurityEvent('dashboard_summary', { userId: req.user.id })

    return res.json({ data: summary, cached: false })
  } catch (error) {
    console.error('[dashboard/summary]', error)
    return res.status(500).json({ message: 'Não foi possível carregar o resumo.' })
  }
})

export function invalidateDashboardCache(userId) {
  cache.del(`dashboard:${userId}`)
}

export default router
