import { apiRequest } from './apiClient.js'

export async function fetchBudgets() {
  const payload = await apiRequest('/budgets')
  return payload.data
}

export async function upsertBudget(category, monthlyLimit) {
  const payload = await apiRequest('/budgets', {
    method: 'PUT',
    body: JSON.stringify({ category, monthlyLimit }),
  })
  return payload.data
}

export async function deleteBudget(id) {
  await apiRequest(`/budgets/${id}`, { method: 'DELETE' })
}
