import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { signToken, verifyToken, authMiddleware } from '../config/auth.js'
import { blacklistToken } from '../config/tokenBlacklist.js'
import { logSecurityEvent } from '../config/logger.js'
import { loginRateLimiter, registerRateLimiter } from '../config/rateLimiter.js'

const router = Router()

const registerValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Informe um e-mail válido.')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('A senha deve ter no mínimo 6 caracteres.'),
]

const loginValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Informe um e-mail válido.')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('A senha deve ter no mínimo 6 caracteres.'),
]

router.post('/register', registerRateLimiter, registerValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    logSecurityEvent('auth_register_validation_failed', {
      email: req.body?.email,
      errors: errors.array().map((item) => item.msg),
    })

    return res.status(400).json({
      message: 'Dados de cadastro inválidos.',
      errors: errors.array().map((item) => item.msg),
    })
  }

  const { name, email, password } = req.body

  try {
    const existing = await User.findByEmail(email)

    if (existing) {
      logSecurityEvent('auth_register_failed', { email, reason: 'email_already_exists' })
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash, name, plan: 'starter' })
    const token = signToken({ id: user.id, email: user.email })

    logSecurityEvent('auth_register_success', { userId: user.id, email: user.email })

    return res.status(201).json({
      token,
      user: User.toPublic(user),
    })
  } catch (error) {
    console.error('[auth/register]', error)
    return res.status(500).json({ message: 'Não foi possível criar a conta.' })
  }
})

router.post('/login', loginRateLimiter, loginValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    logSecurityEvent('auth_login_validation_failed', {
      email: req.body?.email,
      errors: errors.array().map((item) => item.msg),
    })

    return res.status(400).json({
      message: 'Dados de login inválidos.',
      errors: errors.array().map((item) => item.msg),
    })
  }

  const { email, password } = req.body

  try {
    const user = await User.findByEmail(email)

    if (!user) {
      logSecurityEvent('auth_login_failed', { email, reason: 'user_not_found' })
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatches) {
      logSecurityEvent('auth_login_failed', { email, reason: 'invalid_password' })
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })
    }

    const token = signToken({ id: user.id, email: user.email })

    logSecurityEvent('auth_login_success', { userId: user.id, email: user.email })

    return res.json({
      token,
      user: User.toPublic(user),
    })
  } catch (error) {
    console.error('[auth/login]', error)
    return res.status(500).json({ message: 'Não foi possível realizar o login.' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }

    return res.json({ user: User.toPublic(user) })
  } catch (error) {
    console.error('[auth/me]', error)
    return res.status(500).json({ message: 'Não foi possível validar a sessão.' })
  }
})

router.post('/logout', authMiddleware, (req, res) => {
  try {
    const decoded = verifyToken(req.authToken)
    blacklistToken(req.authToken, decoded.exp * 1000)

    logSecurityEvent('auth_logout', { userId: req.user.id })

    return res.json({ message: 'Sessão encerrada com sucesso.' })
  } catch (error) {
    console.error('[auth/logout]', error)
    return res.status(500).json({ message: 'Não foi possível encerrar a sessão.' })
  }
})

const profileValidators = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Informe um e-mail válido.')
    .normalizeEmail(),
  body('currentPassword')
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage('Senha atual inválida.'),
  body('newPassword')
    .optional()
    .trim()
    .isLength({ min: 6 })
    .withMessage('A nova senha deve ter no mínimo 6 caracteres.'),
]

router.patch('/profile', authMiddleware, profileValidators, async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados de perfil inválidos.',
      errors: errors.array().map((item) => item.msg),
    })
  }

  const { name, email, currentPassword, newPassword } = req.body
  const isChangingEmail = Boolean(email)
  const isChangingPassword = Boolean(newPassword)

  if ((isChangingEmail || isChangingPassword) && !currentPassword) {
    return res.status(400).json({
      message: 'Informe a senha atual para alterar e-mail ou senha.',
    })
  }

  try {
    const currentUser = await User.findByEmail(req.user.email)

    if (!currentUser) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }

    if (isChangingEmail || isChangingPassword) {
      const passwordMatches = await bcrypt.compare(currentPassword, currentUser.password_hash)

      if (!passwordMatches) {
        logSecurityEvent('auth_profile_update_failed', {
          userId: req.user.id,
          reason: 'invalid_current_password',
        })
        return res.status(401).json({ message: 'Senha atual incorreta.' })
      }
    }

    if (isChangingEmail && email !== currentUser.email) {
      const existing = await User.findByEmail(email)

      if (existing && existing.id !== currentUser.id) {
        return res.status(409).json({ message: 'Este e-mail já está em uso.' })
      }
    }

    let passwordHash

    if (isChangingPassword) {
      passwordHash = await bcrypt.hash(newPassword, 10)
    }

    const user = await User.updateProfile(req.user.id, {
      name,
      email: isChangingEmail ? email : undefined,
      passwordHash,
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' })
    }

    logSecurityEvent('auth_profile_update', { userId: req.user.id })

    return res.json({ user: User.toPublic(user) })
  } catch (error) {
    console.error('[auth/profile]', error)
    return res.status(500).json({ message: 'Não foi possível atualizar o perfil.' })
  }
})

export default router
