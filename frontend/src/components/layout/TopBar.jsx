import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigation } from '../../contexts/NavigationContext.jsx'
import NavIcon from '../ui/NavIcon.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import styles from './TopBar.module.css'

export default function TopBar() {
  const { user, logout } = useAuth()
  const { currentItem } = useNavigation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = user?.name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || '??'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{currentItem.label}</h1>
        <p className={styles.subtitle}>{currentItem.description}</p>
      </div>

      <div className={styles.actions}>
        <ThemeToggle compact />

        <div className={styles.profileMenu} ref={menuRef}>
          <button
            type="button"
            className={`${styles.profileTrigger} ${menuOpen ? styles.profileTriggerOpen : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className={styles.avatar}>{initials}</span>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
            <NavIcon name="chevronDown" size={16} className={styles.chevron} />
          </button>

          {menuOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownAvatar}>{initials}</span>
                <div>
                  <p className={styles.dropdownName}>{user?.name}</p>
                  <p className={styles.dropdownEmail}>{user?.email}</p>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={styles.logoutBtn}
                role="menuitem"
                onClick={handleLogout}
              >
                <NavIcon name="logOut" size={18} />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
