import React from 'react'
import { useNavigation } from '../../contexts/NavigationContext.jsx'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import MobileNav from './MobileNav.jsx'
import OverviewPage from '../pages/OverviewPage.jsx'
import ExpensesPage from '../pages/ExpensesPage.jsx'
import AnalyticsPage from '../pages/AnalyticsPage.jsx'
import BudgetsPage from '../pages/BudgetsPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import styles from './AppShell.module.css'

const PAGE_MAP = {
  overview: OverviewPage,
  expenses: ExpensesPage,
  analytics: AnalyticsPage,
  budgets: BudgetsPage,
  settings: SettingsPage,
}

export default function AppShell() {
  const { currentView, sidebarCollapsed, isMobile } = useNavigation()
  const PageComponent = PAGE_MAP[currentView] || OverviewPage

  return (
    <div className={styles.shell}>
      {!isMobile && <Sidebar />}

      <div
        className={`${styles.mainArea} ${sidebarCollapsed && !isMobile ? styles.sidebarCollapsed : ''} ${isMobile ? styles.mobile : ''}`}
      >
        <TopBar />

        <main className={styles.content}>
          <PageComponent />
        </main>

        {!isMobile && (
          <footer className={styles.footer}>
            <p>
              GastôMeter SaaS · API REST segura · Câmbio via{' '}
              <a href="https://open.er-api.com" target="_blank" rel="noreferrer">
                ExchangeRate API
              </a>
            </p>
          </footer>
        )}
      </div>

      {isMobile && <MobileNav />}
    </div>
  )
}
