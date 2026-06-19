import cache from './cache.js'

const BLACKLIST_PREFIX = 'blacklist:'

export function blacklistToken(token, expiresAtMs) {
  const ttlSeconds = Math.max(1, Math.ceil((expiresAtMs - Date.now()) / 1000))
  cache.set(`${BLACKLIST_PREFIX}${token}`, true, ttlSeconds)
}

export function isTokenBlacklisted(token) {
  return Boolean(cache.get(`${BLACKLIST_PREFIX}${token}`))
}
