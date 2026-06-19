import React from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigation, NAV_ITEMS } from '../../contexts/NavigationContext.jsx'
import NavIcon from '../ui/NavIcon.jsx'
import Tooltip from '../ui/Tooltip.jsx'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { user } = useAuth()
  const { currentView, navigate, sidebarCollapsed, toggleSidebar } = useNavigation()

  const initials = user?.name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || '??'

  const wrapTooltip = (label, description, node) => (
    sidebarCollapsed ? (
      <Tooltip label={label} description={description}>
        {node}
      </Tooltip>
    ) : node
  )

  return (
    <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.brandWrap}>
        <div className={styles.brand}>
          {wrapTooltip('GastôMeter', 'Finance SaaS', (
            <span className={styles.logoIcon}>
              <NavIcon name="logo" size={26} />
            </span>
          ))}
          {!sidebarCollapsed && (
            <div>
              <p className={styles.logoText}>GastôMeter</p>
              <p className={styles.logoSub}>Finance SaaS</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.collapseBtn}
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <NavIcon name={sidebarCollapsed ? 'chevronRight' : 'chevronLeft'} size={14} />
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const navButton = (
            <button
              type="button"
              className={`${styles.navItem} ${currentView === item.id ? styles.active : ''}`}
              onClick={() => navigate(item.id)}
              aria-label={item.label}
              aria-current={currentView === item.id ? 'page' : undefined}
            >
              <span className={styles.navIcon}>
                <NavIcon name={item.icon} size={20} />
              </span>
              {!sidebarCollapsed && (
                <span className={styles.navLabel}>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              )}
            </button>
          )

          return (
            <React.Fragment key={item.id}>
              {wrapTooltip(item.label, item.description, navButton)}
            </React.Fragment>
          )
        })}
      </nav>

      <div className={styles.footer}>
        {wrapTooltip(user?.name || 'Usuário', user?.email || '', (
          <div className={styles.userCard}>
            <span className={styles.avatar}>{initials}</span>
            {!sidebarCollapsed && (
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user?.name || 'Usuário'}</p>
                <p className={styles.userEmail}>{user?.email}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
