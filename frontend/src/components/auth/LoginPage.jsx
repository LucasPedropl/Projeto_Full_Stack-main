import React, { useState } from 'react'
import * as Yup from 'yup'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import NavIcon from '../ui/NavIcon.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import styles from './LoginPage.module.css'

const loginSchema = Yup.object({
  email: Yup.string().email('Informe um e-mail válido.').required('E-mail é obrigatório.'),
  password: Yup.string().min(6, 'Mínimo de 6 caracteres.').required('Senha é obrigatória.'),
})

const registerSchema = Yup.object({
  name: Yup.string().min(2, 'Mínimo de 2 caracteres.').max(100).required('Nome é obrigatório.'),
  email: Yup.string().email('Informe um e-mail válido.').required('E-mail é obrigatório.'),
  password: Yup.string().min(6, 'Mínimo de 6 caracteres.').required('Senha é obrigatória.'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas não coincidem.')
    .required('Confirme a senha.'),
})

const LOGIN_FORM = { email: '', password: '' }
const REGISTER_FORM = { name: '', email: '', password: '', confirmPassword: '' }

export default function LoginPage() {
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(LOGIN_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isLogin = mode === 'login'

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setForm(nextMode === 'login' ? LOGIN_FORM : REGISTER_FORM)
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      if (isLogin) {
        await loginSchema.validate(form, { abortEarly: false })
        await login(form.email, form.password)
        toast.success('Bem-vindo de volta!')
      } else {
        await registerSchema.validate(form, { abortEarly: false })
        await register(form.name, form.email, form.password)
        toast.success('Conta criada com sucesso!')
      }
    } catch (err) {
      if (err.inner) {
        const fieldErrors = {}
        err.inner.forEach((item) => { fieldErrors[item.path] = item.message })
        setErrors(fieldErrors)
      } else {
        console.error('[auth]', err)
        toast.error(err.message || 'Falha na autenticação.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.themeCorner}>
        <ThemeToggle />
      </div>

      <div className={styles.layout}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            <span className={styles.logoIcon}>
              <NavIcon name="logo" size={36} />
            </span>
            GastôMeter
          </h1>
          <p className={styles.subtitle}>
            Plataforma completa para controlar gastos, orçamentos mensais, relatórios e conversão de moeda — tudo em um só lugar.
          </p>
        </section>

        <section className={styles.card}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${isLogin ? styles.tabActive : ''}`}
              onClick={() => switchMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`}
              onClick={() => switchMode('register')}
            >
              Criar conta
            </button>
          </div>

          <h2 className={styles.cardTitle}>
            {isLogin ? 'Acessar workspace' : 'Criar sua conta'}
          </h2>
          <p className={styles.cardHint}>
            {isLogin
              ? 'Entre na sua conta para gerenciar finanças.'
              : 'Cadastre-se gratuitamente no plano Starter.'}
          </p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div className={styles.group}>
                <label className={styles.label} htmlFor="name">Nome</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Seu nome"
                  value={form.name || ''}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>
            )}

            <div className={styles.group}>
              <label className={styles.label} htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="seu@email.com"
                value={form.email || ''}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="password">Senha</label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${styles.inputWithToggle} ${errors.password ? styles.inputError : ''}`}
                  placeholder="••••••••"
                  value={form.password || ''}
                  onChange={handleChange}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                >
                  <NavIcon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className={styles.group}>
                <label className={styles.label} htmlFor="confirmPassword">Confirmar senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputWithToggle} ${errors.confirmPassword ? styles.inputError : ''}`}
                    placeholder="••••••••"
                    value={form.confirmPassword || ''}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                    aria-pressed={showConfirmPassword}
                  >
                    <NavIcon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={18} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className={styles.error}>{errors.confirmPassword}</span>
                )}
              </div>
            )}

            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              {isSubmitting
                ? <span className={styles.spinner} />
                : (isLogin ? 'Entrar' : 'Criar conta')}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
