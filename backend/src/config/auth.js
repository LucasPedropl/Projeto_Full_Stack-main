import jwt from 'jsonwebtoken'
import { isTokenBlacklisted } from './tokenBlacklist.js'
import { logSecurityEvent } from './logger.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação ausente.' })
  }

  const token = header.slice(7)

  if (isTokenBlacklisted(token)) {
    logSecurityEvent('auth_token_blacklisted', { ip: req.ip })
    return res.status(401).json({ message: 'Sessão encerrada. Faça login novamente.' })
  }

  try {
    req.user = verifyToken(token)
    req.authToken = token
    return next()
  } catch {
    return res.status(401).json({ message: 'Token de autenticação inválido ou expirado.' })
  }
}
