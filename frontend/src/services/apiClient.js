function resolveApiBase() {
	const configured = import.meta.env.VITE_API_BASE_URL?.trim();

	if (!configured) {
		return '/api';
	}

	let base = configured.replace(/\/+$/, '');

	if (base.startsWith('http') && !base.endsWith('/api')) {
		base = `${base}/api`;
	}

	return base;
}

const API_BASE = resolveApiBase();
const TOKEN_KEY = 'gastometer_token';

export function getStoredToken() {
	return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
	if (token) {
		sessionStorage.setItem(TOKEN_KEY, token);
	} else {
		sessionStorage.removeItem(TOKEN_KEY);
	}
}

export async function apiRequest(path, options = {}) {
	const token = getStoredToken();
	const headers = {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...options.headers,
	};

	const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
	const payload = await response.json().catch(() => ({}));

	if (!response.ok) {
		const error = new Error(payload.message || 'Erro na requisição.');
		error.status = response.status;
		error.errors = payload.errors || [];
		throw error;
	}

	return payload;
}
