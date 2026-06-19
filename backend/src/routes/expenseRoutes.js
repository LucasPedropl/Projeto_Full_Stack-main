import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { Expense } from '../models/Expense.js'
import { authMiddleware } from '../config/auth.js'
import cache from '../config/cache.js'
import { logSecurityEvent } from '../config/logger.js'
import { invalidateDashboardCache } from '../routes/dashboardRoutes.js'
import {
  expenseCategoryValidator,
  optionalExpenseCategoryQuery,
} from '../config/categories.js'

const router = Router()

const searchValidators = [
  optionalExpenseCategoryQuery,
  query('description')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Descrição da busca muito longa.'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial inválida.'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final inválida.'),
]

const createValidators = [
  body('description')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Descrição deve ter entre 2 e 100 caracteres.'),
  body('value')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser positivo e no mínimo 0,01.'),
  expenseCategoryValidator,
  body('date')
    .isISO8601()
    .withMessage('Data inválida.'),
]

router.get('/', authMiddleware, searchValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Parâmetros de busca inválidos.',
      errors: errors.array().map((item) => item.msg),
    })
  }

  const filters = {
    userId: req.user.id,
    category: req.query.category,
    description: req.query.description,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  }

  const cacheKey = `expenses:${req.user.id}:${JSON.stringify(filters)}`
  const cached = cache.get(cacheKey)

  if (cached) {
    return res.json({ data: cached, cached: true })
  }

  try {
    const expenses = await Expense.search(filters)
    cache.set(cacheKey, expenses)

    logSecurityEvent('expense_search', {
      userId: req.user.id,
      filters,
      resultCount: expenses.length,
    })

    return res.json({ data: expenses, cached: false })
  } catch (error) {
    console.error('[expenses/search]', error)
    return res.status(500).json({ message: 'Não foi possível buscar os gastos.' })
  }
})

router.post('/', authMiddleware, createValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados do gasto inválidos.',
      errors: errors.array().map((item) => item.msg),
    })
  }

  const { description, value, category, date } = req.body

  try {
    const expense = await Expense.create({
      userId: req.user.id,
      description,
      value,
      category,
      date,
    })

    cache.keys().forEach((key) => {
      if (key.startsWith(`expenses:${req.user.id}:`)) {
        cache.del(key)
      }
    })

    invalidateDashboardCache(req.user.id)

    logSecurityEvent('expense_create', {
      userId: req.user.id,
      expenseId: expense.id,
      category,
    })

    return res.status(201).json({ data: expense })
  } catch (error) {
    console.error('[expenses/create]', error)
    return res.status(500).json({ message: 'Não foi possível inserir o gasto.' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ message: 'ID do gasto inválido.' })
  }

  try {
    const deleted = await Expense.delete(id, req.user.id)

    if (!deleted) {
      return res.status(404).json({ message: 'Gasto não encontrado.' })
    }

    cache.keys().forEach((key) => {
      if (key.startsWith(`expenses:${req.user.id}:`)) {
        cache.del(key)
      }
    })

    invalidateDashboardCache(req.user.id)

    logSecurityEvent('expense_delete', { userId: req.user.id, expenseId: id })

    return res.json({ message: 'Gasto removido com sucesso.' })
  } catch (error) {
    console.error('[expenses/delete]', error)
    return res.status(500).json({ message: 'Não foi possível remover o gasto.' })
  }
})

export default router
