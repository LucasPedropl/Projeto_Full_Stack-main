import { apiRequest } from './apiClient.js'

export function normalizeIncome(row) {
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

export async function fetchIncomes(filters = {}) {
  const payload = await apiRequest(`/incomes${buildSearchQuery(filters)}`)
  return {
    incomes: (payload.data || []).map(normalizeIncome),
    cached: Boolean(payload.cached),
  }
}

export async function createIncome(data) {
  const payload = await apiRequest('/incomes', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return normalizeIncome(payload.data)
}

export async function deleteIncome(id) {
  await apiRequest(`/incomes/${id}`, { method: 'DELETE' })
}
