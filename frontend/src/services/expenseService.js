import { apiRequest } from './apiClient.js';
import { buildSearchQuery, normalizeTransactionRow } from './searchQuery.js';

export function normalizeExpense(row) {
	return normalizeTransactionRow(row);
}

export async function fetchExpenses(filters = {}) {
	const payload = await apiRequest(`/expenses${buildSearchQuery(filters)}`);
	return {
		expenses: (payload.data || []).map(normalizeExpense),
		cached: Boolean(payload.cached),
	};
}

export async function createExpense(data) {
	const payload = await apiRequest('/expenses', {
		method: 'POST',
		body: JSON.stringify(data),
	});

	return normalizeExpense(payload.data);
}

export async function deleteExpense(id) {
	await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
}
