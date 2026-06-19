import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useToast } from '../../contexts/ToastContext.jsx'
import styles from './AccountSettingsForm.module.css'

export default function AccountSettingsForm() {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
  }, [user?.name, user?.email])

  const credentialsChanged = useMemo(
    () => email.trim() !== (user?.email || '') || newPassword.length > 0,
    [email, newPassword, user?.email],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('A confirmação da nova senha não confere.')
      return
    }

    if (credentialsChanged && !currentPassword) {
      toast.error('Informe a senha atual para alterar e-mail ou senha.')
      return
    }

    setIsSaving(true)

    try {
      const payload = { name: name.trim() }

      if (email.trim() !== user?.email) {
        payload.email = email.trim()
      }

      if (newPassword) {
        payload.newPassword = newPassword
      }

      if (credentialsChanged) {
        payload.currentPassword = currentPassword
      }

      await updateProfile(payload)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Perfil atualizado!')
    } catch (error) {
      console.error('[settings/account]', error)
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="settings-name">Nome de exibição</label>
        <input
          id="settings-name"
          type="text"
          className={styles.input}
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="settings-email">E-mail</label>
        <input
          id="settings-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className={styles.divider}>
        <span>Alterar senha</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="settings-current-password">Senha atual</label>
        <input
          id="settings-current-password"
          type="password"
          className={styles.input}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          placeholder={credentialsChanged ? 'Obrigatória para alterar e-mail/senha' : 'Opcional'}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="settings-new-password">Nova senha</label>
          <input
            id="settings-new-password"
            type="password"
            className={styles.input}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="settings-confirm-password">Confirmar nova senha</label>
          <input
            id="settings-confirm-password"
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
          />
        </div>
      </div>

      <button type="submit" className={styles.submit} disabled={isSaving}>
        {isSaving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
