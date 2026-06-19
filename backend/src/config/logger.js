import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOG_DIR = path.join(__dirname, '../../logs')
const LOG_FILE = path.join(LOG_DIR, 'security.log')

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

export function logSecurityEvent(event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  }

  const line = JSON.stringify(entry)

  console.info('[security-log]', line)

  try {
    ensureLogDir()
    fs.appendFileSync(LOG_FILE, `${line}\n`, 'utf-8')
  } catch (error) {
    console.error('[security-log] Falha ao gravar arquivo:', error.message)
  }
}
