import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { MOBILE_QUERY, useMediaQuery } from '../hooks/useMediaQuery.js'

const NavigationContext = createContext(null)

export const NAV_ITEMS = [
  { id: 'overview', label: 'Visão Geral', icon: 'overview', description: 'Painel e métricas' },
  { id: 'expenses', label: 'Lançamentos', icon: 'expenses', description: 'Despesas e receitas' },
  { id: 'analytics', label: 'Relatórios', icon: 'analytics', description: 'Análise por categoria' },
  { id: 'budgets', label: 'Orçamentos', icon: 'budgets', description: 'Limites mensais' },
  { id: 'settings', label: 'Configurações', icon: 'settings', description: 'Perfil e preferências' },
]

export function NavigationProvider({ children }) {
  const [currentView, setCurrentView] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useMediaQuery(MOBILE_QUERY)

  const navigate = useCallback((viewId) => {
    setCurrentView(viewId)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => !current)
  }, [])

  const currentItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === currentView) || NAV_ITEMS[0],
    [currentView],
  )

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        currentItem,
        sidebarCollapsed,
        isMobile,
        navigate,
        toggleSidebar,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation deve ser usado dentro de NavigationProvider')
  }
  return context
}
