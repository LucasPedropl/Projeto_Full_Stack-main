import React from 'react'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { ExpenseProvider } from './contexts/ExpenseContext.jsx'
import { IncomeProvider } from './contexts/IncomeContext.jsx'
import { NavigationProvider } from './contexts/NavigationContext.jsx'
import LoginPage from './components/auth/LoginPage.jsx'
import AppShell from './components/layout/AppShell.jsx'
import LoadingScreen from './components/ui/LoadingScreen.jsx'
import ToastContainer from './components/ui/ToastContainer.jsx'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <NavigationProvider>
      <ExpenseProvider>
        <IncomeProvider>
          <AppShell />
        </IncomeProvider>
      </ExpenseProvider>
    </NavigationProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
