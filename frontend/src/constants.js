export const CATEGORIES = [
  { value: 'food',       label: 'Alimentação',   emoji: '🍽️',  color: 'var(--cat-food)' },
  { value: 'transport',  label: 'Transporte',    emoji: '🚗',  color: 'var(--cat-transport)' },
  { value: 'leisure',   label: 'Lazer',          emoji: '🎮',  color: 'var(--cat-leisure)' },
  { value: 'health',    label: 'Saúde',          emoji: '💊',  color: 'var(--cat-health)' },
  { value: 'housing',   label: 'Moradia',        emoji: '🏠',  color: 'var(--cat-housing)' },
  { value: 'education', label: 'Educação',       emoji: '📚',  color: 'var(--cat-education)' },
  { value: 'other',     label: 'Outros',         emoji: '📦',  color: 'var(--cat-other)' },
]

export const getCategoryMeta = (value, customCategories = []) => {
  const merged = [...CATEGORIES, ...customCategories]
  const found = merged.find((category) => category.value === value)

  if (found) return found

  if (value?.startsWith('custom_')) {
    return {
      value,
      label: value.replace(/^custom_/, '').replace(/_/g, ' '),
      emoji: '📌',
      color: 'var(--cat-other)',
    }
  }

  return CATEGORIES[CATEGORIES.length - 1]
}

export const INCOME_CATEGORIES = [
  { value: 'salary',     label: 'Salário',      emoji: '💼', color: 'var(--inc-salary)' },
  { value: 'freelance',  label: 'Freelance',    emoji: '🖥️', color: 'var(--inc-freelance)' },
  { value: 'investment', label: 'Investimentos', emoji: '📈', color: 'var(--inc-investment)' },
  { value: 'gift',       label: 'Presente',     emoji: '🎁', color: 'var(--inc-gift)' },
  { value: 'rental',     label: 'Aluguel',      emoji: '🏘️', color: 'var(--inc-rental)' },
  { value: 'other',      label: 'Outros',       emoji: '💰', color: 'var(--inc-other)' },
]

export const getIncomeCategoryMeta = (value, customCategories = []) => {
  const merged = [...INCOME_CATEGORIES, ...customCategories]
  const found = merged.find((category) => category.value === value)

  if (found) return found

  if (value?.startsWith('custom_')) {
    return {
      value,
      label: value.replace(/^custom_/, '').replace(/_/g, ' '),
      emoji: '📌',
      color: 'var(--inc-other)',
    }
  }

  return INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1]
}

export const CURRENCIES = [
  { code: 'USD', label: 'Dólar (USD)', symbol: '$' },
  { code: 'EUR', label: 'Euro (EUR)',  symbol: '€' },
  { code: 'GBP', label: 'Libra (GBP)', symbol: '£' },
  { code: 'ARS', label: 'Peso Argentino (ARS)', symbol: '$' },
  { code: 'BTC', label: 'Bitcoin (BTC)', symbol: '₿' },
]

export const PLANS = {
  starter: { label: 'Starter', badge: 'Grátis' },
  pro: { label: 'Pro', badge: 'Popular' },
  business: { label: 'Business', badge: 'Empresas' },
}

export const formatBRL = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
