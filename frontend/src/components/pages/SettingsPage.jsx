import React from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import PageHeader from '../ui/PageHeader.jsx'
import AccountSettingsForm from './AccountSettingsForm.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import pageStyles from '../../styles/page.module.css'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme } = useTheme()

  return (
    <div className={pageStyles.page}>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie seu perfil, aparência e preferências da conta."
        badge="Conta"
      />

      <section className={`${pageStyles.card} ${styles.profileCard}`}>
        <div className={styles.avatar}>
          {user?.name?.slice(0, 2).toUpperCase() || '??'}
        </div>
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
      </section>

      <section className={`${pageStyles.card} ${styles.formCard}`}>
        <h3>Aparência</h3>
        <p className={styles.themeHint}>
          Tema atual: <strong>{theme === 'dark' ? 'Escuro' : 'Claro'}</strong>
        </p>
        <ThemeToggle />
      </section>

      <section className={`${pageStyles.card} ${styles.formCard}`}>
        <h3>Informações da conta</h3>
        <AccountSettingsForm />
      </section>
    </div>
  )
}
