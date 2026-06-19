import { apiRequest } from './apiClient.js'
import { buildSearchQuery, normalizeTransactionRow } from './searchQuery.js'

export function normalizeIncome(row) {
  return normalizeTransactionRow(row)
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
