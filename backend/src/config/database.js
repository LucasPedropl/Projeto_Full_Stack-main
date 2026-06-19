import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const DB_MODE = (process.env.DB_MODE || 'auto').toLowerCase()

let activePool = null
let activeSource = null

function buildLocalConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'gastometer',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
}

function buildRemoteConfig() {
  if (!process.env.DATABASE_URL) {
    return null
  }

  return {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false'
      ? false
      : { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
}

function buildAttempts() {
  const remote = buildRemoteConfig()
  const attempts = []

  if (DB_MODE === 'local') {
    attempts.push({ label: 'Docker local', config: buildLocalConfig() })
    return attempts
  }

  if (DB_MODE === 'render' || DB_MODE === 'remote') {
    if (!remote) {
      throw new Error('DATABASE_URL é obrigatória quando DB_MODE=render.')
    }
    attempts.push({ label: 'Render/cloud', config: remote })
    return attempts
  }

  if (remote) {
    attempts.push({ label: 'Render/cloud', config: remote })
  }

  attempts.push({ label: 'Docker local', config: buildLocalConfig() })
  return attempts
}

async function closePool(pool) {
  if (!pool) return
  try {
    await pool.end()
  } catch {
  }
}

export async function connectDatabase() {
  if (activePool) {
    return activePool
  }

  const attempts = buildAttempts()
  let lastError = null

  for (const attempt of attempts) {
    const candidate = new pg.Pool(attempt.config)

    try {
      await candidate.query('SELECT 1')
      activePool = candidate
      activeSource = attempt.label

      activePool.on('error', (error) => {
        console.error('[database] Erro inesperado no pool de conexões:', error)
      })

      console.info(`[database] Conectado (${activeSource})`)
      return activePool
    } catch (error) {
      lastError = error
      console.warn(`[database] ${attempt.label} indisponível: ${error.message}`)
      await closePool(candidate)
    }
  }

  throw lastError || new Error('Nenhuma fonte de banco de dados disponível.')
}

export async function disconnectDatabase() {
  await closePool(activePool)
  activePool = null
  activeSource = null
}

export function getDatabaseSource() {
  return activeSource
}

const poolProxy = new Proxy({}, {
  get(_target, property) {
    if (!activePool) {
      throw new Error('Banco não inicializado. Chame connectDatabase() antes de usar o pool.')
    }

    const value = activePool[property]
    return typeof value === 'function' ? value.bind(activePool) : value
  },
})

export default poolProxy
