import { apiRequest } from './apiClient.js'

export async function fetchDashboardSummary(options = {}) {
  const query = options.refresh ? '?refresh=1' : ''
  const payload = await apiRequest(`/dashboard/summary${query}`)
  return {
    summary: payload.data,
    cached: payload.cached,
  }
}
