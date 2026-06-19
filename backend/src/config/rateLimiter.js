import rateLimit from 'express-rate-limit'
import { logSecurityEvent } from './logger.js'

export const loginRateLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
  handler: (req, res) => {
    logSecurityEvent('auth_login_rate_limited', { ip: req.ip, email: req.body?.email })
    res.status(429).json({ message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' })
  },
})

export const registerRateLimiter = rateLimit({
  windowMs: Number(process.env.REGISTER_RATE_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.REGISTER_RATE_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.' },
  handler: (req, res) => {
    logSecurityEvent('auth_register_rate_limited', { ip: req.ip, email: req.body?.email })
    res.status(429).json({ message: 'Muitas tentativas de cadastro. Tente novamente mais tarde.' })
  },
})
