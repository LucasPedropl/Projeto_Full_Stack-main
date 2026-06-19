import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { Budget } from '../models/Budget.js'
import { authMiddleware } from '../config/auth.js'
import { logSecurityEvent } from '../config/logger.js'

const router = Router()

const VALID_CATEGORIES = [
  'food',
  'transport',
  'leisure',
  'health',
  'housing',
  'education',
  'other',
]

const upsertValidators = [
  body('category')
    .isIn(VALID_CATEGORIES)
    .withMessage('Categoria inválida.'),
  body('monthlyLimit')
    .isFloat({ min: 0.01 })
    .withMessage('Limite mensal deve ser positivo.'),
]

router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.listByUser(req.user.id)
    return res.json({ data: budgets })
  } catch (error) {
    console.error('[budgets/list]', error)
    return res.status(500).json({ message: 'Não foi possível listar os orçamentos.' })
  }
})

router.put('/', authMiddleware, upsertValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados do orçamento inválidos.',
      errors: errors.array().map((item) => item.msg),
    })
  }

  const { category, monthlyLimit } = req.body

  try {
    const budget = await Budget.upsert({
      userId: req.user.id,
      category,
      monthlyLimit,
    })

    logSecurityEvent('budget_upsert', { userId: req.user.id, category })

    return res.json({ data: budget })
  } catch (error) {
    console.error('[budgets/upsert]', error)
    return res.status(500).json({ message: 'Não foi possível salvar o orçamento.' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ message: 'ID do orçamento inválido.' })
  }

  try {
    const deleted = await Budget.delete(id, req.user.id)

    if (!deleted) {
      return res.status(404).json({ message: 'Orçamento não encontrado.' })
    }

    logSecurityEvent('budget_delete', { userId: req.user.id, budgetId: id })

    return res.json({ message: 'Orçamento removido com sucesso.' })
  } catch (error) {
    console.error('[budgets/delete]', error)
    return res.status(500).json({ message: 'Não foi possível remover o orçamento.' })
  }
})

export default router
