import React, { useMemo, useState } from 'react'
import * as Yup from 'yup'
import { useExpenses } from '../contexts/ExpenseContext.jsx'
import { CATEGORIES } from '../constants.js'
import { useCustomCategories } from '../hooks/useCustomCategories.js'
import SearchableSelect from './ui/SearchableSelect.jsx'
import styles from './ExpenseForm.module.css'

const EMPTY_FORM = {
  description: '',
  value: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
}

export default function ExpenseForm({ inModal = false, onSuccess }) {
  const { addExpense, isSubmitting } = useExpenses()
  const { customCategories, addCategory, categoryValues } = useCustomCategories('expense')
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const categoryOptions = useMemo(() => [
    ...CATEGORIES.map((cat) => ({
      value: cat.value,
      label: `${cat.emoji} ${cat.label}`,
    })),
    ...customCategories.map((cat) => ({
      value: cat.value,
      label: `${cat.emoji} ${cat.label}`,
    })),
  ], [customCategories])

  const schema = useMemo(() => {
    const allowed = [...CATEGORIES.map((cat) => cat.value), ...categoryValues]

    return Yup.object({
      description: Yup.string()
        .min(2, 'Descrição muito curta (mínimo 2 caracteres)')
        .max(100, 'Descrição muito longa (máximo 100 caracteres)')
        .required('Descrição é obrigatória'),
      value: Yup.number()
        .typeError('Valor deve ser um número')
        .positive('Valor deve ser positivo')
        .min(0.01, 'Valor mínimo é R$ 0,01')
        .required('Valor é obrigatório'),
      category: Yup.string()
        .oneOf(allowed, 'Selecione uma categoria válida')
        .required('Categoria é obrigatória'),
      date: Yup.string().required('Data é obrigatória'),
    })
  }, [categoryValues])

  const validateField = async (name, value) => {
    try {
      await Yup.reach(schema, name).validate(value)
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: err.message }))
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) validateField(name, value)
  }

  const handleCategoryChange = (value) => {
    setForm((prev) => ({ ...prev, category: value }))
    setTouched((prev) => ({ ...prev, category: true }))
    validateField('category', value)
  }

  const handleBlur = (event) => {
    const { name, value } = event.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched({ description: true, value: true, category: true, date: true })

    try {
      const validated = await schema.validate(form, { abortEarly: false })
      await addExpense({
        ...validated,
        value: Number(validated.value),
      })
      setForm({ ...EMPTY_FORM, date: new Date().toISOString().split('T')[0] })
      setErrors({})
      setTouched({})
      onSuccess?.()
    } catch (err) {
      if (err.inner) {
        const fieldErrors = {}
        err.inner.forEach((item) => { fieldErrors[item.path] = item.message })
        setErrors(fieldErrors)
      }
    }
  }

  const fieldClass = (name) =>
    `${styles.field} ${touched[name] && errors[name] ? styles.fieldError : ''} ${touched[name] && !errors[name] && form[name] ? styles.fieldValid : ''}`

  const formContent = (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.group}>
          <label className={styles.label} htmlFor="description">Descrição</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="Ex: Almoço no restaurante"
            className={fieldClass('description')}
            value={form.description}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
          />
          {touched.description && errors.description && (
            <span className={styles.error}>{errors.description}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label} htmlFor="value">Valor (R$)</label>
            <input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className={fieldClass('value')}
              value={form.value}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.value && errors.value && (
              <span className={styles.error}>{errors.value}</span>
            )}
          </div>

          <div className={styles.group}>
            <SearchableSelect
              label="Categoria"
              value={form.category}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="Selecione..."
              searchPlaceholder="Pesquisar categoria..."
              error={touched.category ? errors.category : undefined}
              allowCreate
              createLabel="Nova categoria"
              onCreateOption={addCategory}
            />
          </div>
        </div>

        <div className={styles.group}>
          <label className={styles.label} htmlFor="date">Data</label>
          <input
            id="date"
            name="date"
            type="date"
            className={fieldClass('date')}
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.date && errors.date && (
            <span className={styles.error}>{errors.date}</span>
          )}
        </div>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Adicionar Gasto'}
        </button>
      </form>
  )

  if (inModal) return formContent

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>
        <span className={styles.titleIcon}>＋</span>
        Novo Gasto
      </h2>
      {formContent}
    </div>
  )
}
