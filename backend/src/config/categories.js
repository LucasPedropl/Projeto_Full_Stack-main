import { body, query } from 'express-validator'

export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'leisure',
  'health',
  'housing',
  'education',
  'other',
]

export const INCOME_CATEGORIES = [
  'salary',
  'freelance',
  'investment',
  'gift',
  'rental',
  'other',
]

const CUSTOM_CATEGORY_PATTERN = /^custom_[a-z0-9_]{2,40}$/

export function isValidExpenseCategory(value) {
  return EXPENSE_CATEGORIES.includes(value) || CUSTOM_CATEGORY_PATTERN.test(value)
}

export function isValidIncomeCategory(value) {
  return INCOME_CATEGORIES.includes(value) || CUSTOM_CATEGORY_PATTERN.test(value)
}

export const expenseCategoryValidator = body('category')
  .trim()
  .custom((value) => {
    if (!isValidExpenseCategory(value)) {
      throw new Error('Categoria inválida.')
    }
    return true
  })

export const incomeCategoryValidator = body('category')
  .trim()
  .custom((value) => {
    if (!isValidIncomeCategory(value)) {
      throw new Error('Categoria inválida.')
    }
    return true
  })

export const optionalExpenseCategoryQuery = query('category')
  .optional()
  .trim()
  .custom((value) => {
    if (value && !isValidExpenseCategory(value)) {
      throw new Error('Categoria inválida.')
    }
    return true
  })

export const optionalIncomeCategoryQuery = query('category')
  .optional()
  .trim()
  .custom((value) => {
    if (value && !isValidIncomeCategory(value)) {
      throw new Error('Categoria inválida.')
    }
    return true
  })
