import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

const STORAGE_PREFIX = 'gastometer_custom_categories'

function storageKey(userId, type) {
  return `${STORAGE_PREFIX}_${userId}_${type}`
}

function readStored(userId, type) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(storageKey(userId, type))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function slugifyCategoryLabel(label) {
  const base = label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  return `custom_${base || 'nova'}`
}

/**
 * Gerencia categorias personalizadas por usuário (localStorage).
 */
export function useCustomCategories(type) {
  const { user } = useAuth()
  const userId = user?.id
  const [customCategories, setCustomCategories] = useState([])

  useEffect(() => {
    setCustomCategories(readStored(userId, type))
  }, [userId, type])

  const persist = useCallback((next) => {
    setCustomCategories(next)
    if (userId) {
      localStorage.setItem(storageKey(userId, type), JSON.stringify(next))
    }
  }, [userId, type])

  const addCategory = useCallback((label) => {
    const trimmed = label.trim()
    if (trimmed.length < 2) {
      throw new Error('Nome da categoria deve ter pelo menos 2 caracteres.')
    }

    let value = slugifyCategoryLabel(trimmed)
    let suffix = 1

    while (
      customCategories.some((item) => item.value === value)
    ) {
      value = `${slugifyCategoryLabel(trimmed)}_${suffix}`
      suffix += 1
    }

    const category = {
      value,
      label: trimmed,
      emoji: '📌',
      color: type === 'income' ? 'var(--inc-other)' : 'var(--cat-other)',
      isCustom: true,
    }

    persist([...customCategories, category])
    return category
  }, [customCategories, persist, type])

  const categoryValues = useMemo(
    () => customCategories.map((item) => item.value),
    [customCategories],
  )

  return { customCategories, addCategory, categoryValues }
}
