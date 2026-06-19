import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './SearchableSelect.module.css'

function computeDropdownPosition(triggerEl) {
  const rect = triggerEl.getBoundingClientRect()
  const maxHeight = 280
  const gap = 6
  const spaceBelow = window.innerHeight - rect.bottom - gap
  const spaceAbove = rect.top - gap
  const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow

  const height = Math.min(maxHeight, openUpward ? spaceAbove : spaceBelow)
  const top = openUpward
    ? Math.max(8, rect.top - height - gap)
    : rect.bottom + gap

  return {
    position: 'fixed',
    top,
    left: rect.left,
    width: rect.width,
    maxHeight: height,
    zIndex: 700,
  }
}

export default function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Pesquisar...',
  error,
  disabled = false,
  allowCreate = false,
  createLabel = 'Nova categoria',
  onCreateOption,
}) {
  const generatedId = useId()
  const fieldId = id || generatedId
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownStyle, setDropdownStyle] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [createError, setCreateError] = useState('')

  const selected = options.find((option) => option.value === value)

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }, [options, search])

  const updatePosition = () => {
    if (triggerRef.current) {
      setDropdownStyle(computeDropdownPosition(triggerRef.current))
    }
  }

  useEffect(() => {
    if (!isOpen) return undefined

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inContainer = containerRef.current?.contains(event.target)
      const inDropdown = dropdownRef.current?.contains(event.target)

      if (!inContainer && !inDropdown) {
        setIsOpen(false)
        setSearch('')
        setIsCreating(false)
        setNewLabel('')
        setCreateError('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeDropdown = () => {
    setIsOpen(false)
    setSearch('')
    setIsCreating(false)
    setNewLabel('')
    setCreateError('')
  }

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    closeDropdown()
  }

  const handleToggle = () => {
    if (disabled) return
    setIsOpen((open) => {
      if (open) {
        setIsCreating(false)
        setNewLabel('')
        setCreateError('')
        setSearch('')
      }
      return !open
    })
  }

  const handleCreate = () => {
    if (!onCreateOption) return

    try {
      const created = onCreateOption(newLabel)
      onChange(created.value)
      closeDropdown()
    } catch (err) {
      setCreateError(err.message || 'Não foi possível criar a categoria.')
    }
  }

  const dropdownContent = isOpen && dropdownStyle && (
    <div
      ref={dropdownRef}
      className={styles.dropdownPortal}
      style={dropdownStyle}
      role="presentation"
    >
      <input
        className={styles.search}
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={searchPlaceholder}
        autoFocus
      />

      <ul className={styles.list} role="listbox">
        {filteredOptions.length === 0 ? (
          <li className={styles.empty}>Nenhum resultado</li>
        ) : (
          filteredOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`${styles.option} ${option.value === value ? styles.optionActive : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))
        )}
      </ul>

      {allowCreate && (
        <div className={styles.createSection}>
          {!isCreating ? (
            <button
              type="button"
              className={styles.createBtn}
              onClick={() => {
                setIsCreating(true)
                setCreateError('')
                setNewLabel(search.trim())
              }}
            >
              + {createLabel}
            </button>
          ) : (
            <div className={styles.createForm}>
              <input
                type="text"
                className={styles.createInput}
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                placeholder="Nome da categoria"
                maxLength={40}
                autoFocus
              />
              <div className={styles.createActions}>
                <button
                  type="button"
                  className={styles.createCancel}
                  onClick={() => {
                    setIsCreating(false)
                    setNewLabel('')
                    setCreateError('')
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.createConfirm}
                  onClick={handleCreate}
                  disabled={newLabel.trim().length < 2}
                >
                  Criar
                </button>
              </div>
              {createError && <span className={styles.createError}>{createError}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className={styles.group} ref={containerRef}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      )}

      <button
        id={fieldId}
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${error ? styles.triggerError : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
      </button>

      {dropdownContent && createPortal(dropdownContent, document.body)}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
