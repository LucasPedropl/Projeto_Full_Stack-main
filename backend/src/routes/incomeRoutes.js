import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { Income } from '../models/Income.js'
import { authMiddleware } from '../config/auth.js'
import cache from '../config/cache.js'
import { logSecurityEvent } from '../config/logger.js'
import { invalidateDashboardCache } from '../routes/dashboardRoutes.js'
import {
  incomeCategoryValidator,
  optionalIncomeCategoryQuery,
} from '../config/categories.js'

const router = Router()

const searchValidators = [
  optionalIncomeCategoryQuery,
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
  incomeCategoryValidator,
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

  const cacheKey = `incomes:${req.user.id}:${JSON.stringify(filters)}`
  const cached = cache.get(cacheKey)

  if (cached) {
    return res.json({ data: cached, cached: true })
  }

  try {
    const incomes = await Income.search(filters)
    cache.set(cacheKey, incomes)

    logSecurityEvent('income_search', {
      userId: req.user.id,
      filters,
      resultCount: incomes.length,
    })

    return res.json({ data: incomes, cached: false })
  } catch (error) {
    console.error('[incomes/search]', error)
    return res.status(500).json({ message: 'Não foi possível buscar as receitas.' })
  }
})

router.post('/', authMiddleware, createValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados da receita inválidos.',
      errors: errors.array().map((item) => item.msg),
    })
  }

  const { description, value, category, date } = req.body

  try {
    const income = await Income.create({
      userId: req.user.id,
      description,
      value,
      category,
      date,
    })

    cache.keys().forEach((key) => {
      if (key.startsWith(`incomes:${req.user.id}:`)) {
        cache.del(key)
      }
    })

    invalidateDashboardCache(req.user.id)

    logSecurityEvent('income_create', {
      userId: req.user.id,
      incomeId: income.id,
      category,
    })

    return res.status(201).json({ data: income })
  } catch (error) {
    console.error('[incomes/create]', error)
    return res.status(500).json({ message: 'Não foi possível inserir a receita.' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ message: 'ID da receita inválido.' })
  }

  try {
    const deleted = await Income.delete(id, req.user.id)

    if (!deleted) {
      return res.status(404).json({ message: 'Receita não encontrada.' })
    }

    cache.keys().forEach((key) => {
      if (key.startsWith(`incomes:${req.user.id}:`)) {
        cache.del(key)
      }
    })

    invalidateDashboardCache(req.user.id)

    logSecurityEvent('income_delete', { userId: req.user.id, incomeId: id })

    return res.json({ message: 'Receita removida com sucesso.' })
  } catch (error) {
    console.error('[incomes/delete]', error)
    return res.status(500).json({ message: 'Não foi possível remover a receita.' })
  }
})

export default router
