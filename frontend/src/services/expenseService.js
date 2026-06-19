import { apiRequest } from './apiClient.js'

export function normalizeExpense(row) {
  return {
    id: row.id,
    description: row.description,
    value: Number(row.value),
    category: row.category,
    date: typeof row.date === 'string' ? row.date.split('T')[0] : row.date,
    createdAt: row.created_at,
  }
}

function buildSearchQuery(filters = {}) {
  const params = new URLSearchParams()

  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category)
  }
  if (filters.description?.trim()) {
    params.set('description', filters.description.trim())
  }
  if (filters.startDate) {
    params.set('startDate', filters.startDate)
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function fetchExpenses(filters = {}) {
  const payload = await apiRequest(`/expenses${buildSearchQuery(filters)}`)
  return {
    expenses: (payload.data || []).map(normalizeExpense),
    cached: Boolean(payload.cached),
  }
}

export async function createExpense(data) {
  const payload = await apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return normalizeExpense(payload.data)
}

export async function deleteExpense(id) {
  await apiRequest(`/expenses/${id}`, { method: 'DELETE' })
}
