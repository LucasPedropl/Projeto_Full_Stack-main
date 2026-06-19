import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {
	createExpense,
	deleteExpense,
	fetchExpenses,
} from '../services/expenseService.js';
import { useToast } from './ToastContext.jsx';

const ExpenseContext = createContext(null);

const EMPTY_FILTERS = {
	category: 'all',
	description: '',
	startDate: '',
	endDate: '',
};

export function ExpenseProvider({ children }) {
	const { toast } = useToast();
	const [expenses, setExpenses] = useState([]);
	const [filters, setFilters] = useState(EMPTY_FILTERS);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [fromCache, setFromCache] = useState(false);
	const [dataVersion, setDataVersion] = useState(0);

	const loadExpenses = useCallback(
		async (searchFilters) => {
			setIsLoading(true);
			setError(null);

			try {
				const result = await fetchExpenses(searchFilters);
				setExpenses(result.expenses);
				setFromCache(result.cached);
			} catch (err) {
				console.error('[expenses]', err);
				setError(err.message);
				toast.error(err.message);
			} finally {
				setIsLoading(false);
			}
		},
		[toast],
	);

	useEffect(() => {
		loadExpenses(EMPTY_FILTERS);
	}, [loadExpenses]);

	const applySearch = useCallback(
		async (nextFilters) => {
			setFilters(nextFilters);
			await loadExpenses(nextFilters);
		},
		[loadExpenses],
	);

	const clearSearch = useCallback(async () => {
		setFilters(EMPTY_FILTERS);
		await loadExpenses(EMPTY_FILTERS);
	}, [loadExpenses]);

	const addExpense = useCallback(
		async (expense) => {
			setIsSubmitting(true);

			try {
				const created = await createExpense(expense);
				await loadExpenses(filters);
				setDataVersion((v) => v + 1);
				toast.success('Gasto adicionado com sucesso!');
				return created;
			} catch (err) {
				console.error('[expenses/create]', err);
				const message = err.errors?.length
					? err.errors.join(' · ')
					: err.message;
				toast.error(message);
				throw err;
			} finally {
				setIsSubmitting(false);
			}
		},
		[toast, loadExpenses, filters],
	);

	const removeExpense = useCallback(
		async (id) => {
			try {
				await deleteExpense(id);
				await loadExpenses(filters);
				setDataVersion((v) => v + 1);
				toast.success('Gasto removido.');
			} catch (err) {
				console.error('[expenses/delete]', err);
				toast.error(err.message);
			}
		},
		[toast, loadExpenses, filters],
	);

	const totalGeneral = useMemo(
		() => expenses.reduce((sum, item) => sum + Number(item.value), 0),
		[expenses],
	);

	const totalByCategory = useMemo(
		() =>
			expenses.reduce((acc, item) => {
				acc[item.category] =
					(acc[item.category] || 0) + Number(item.value);
				return acc;
			}, {}),
		[expenses],
	);

	const stats = useMemo(() => {
		const now = new Date();
		const month = now.getMonth();
		const year = now.getFullYear();

		const monthExpenses = expenses.filter((item) => {
			const date = new Date(`${item.date}T00:00:00`);
			return date.getMonth() === month && date.getFullYear() === year;
		});

		const monthTotal = monthExpenses.reduce(
			(sum, item) => sum + item.value,
			0,
		);
		const highest = expenses.reduce(
			(max, item) => (item.value > max ? item.value : max),
			0,
		);

		return {
			monthTotal,
			monthCount: monthExpenses.length,
			average: expenses.length ? totalGeneral / expenses.length : 0,
			highest,
		};
	}, [expenses, totalGeneral]);

	return (
		<ExpenseContext.Provider
			value={{
				expenses,
				filters,
				isLoading,
				isSubmitting,
				error,
				fromCache,
				dataVersion,
				totalGeneral,
				totalByCategory,
				stats,
				addExpense,
				removeExpense,
				applySearch,
				clearSearch,
				refreshExpenses: () => loadExpenses(filters),
			}}
		>
			{children}
		</ExpenseContext.Provider>
	);
}

export function useExpenses() {
	const context = useContext(ExpenseContext);
	if (!context) {
		throw new Error('useExpenses deve ser usado dentro de ExpenseProvider');
	}
	return context;
}
