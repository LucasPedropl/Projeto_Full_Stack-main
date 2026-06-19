import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import app from './src/config/app.js'
import { connectDatabase } from './src/config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const port = Number(process.env.PORT) || 3001
const useHttps = process.env.USE_HTTPS === 'true'

function createServerInstance() {
  if (!useHttps) {
    return http.createServer(app)
  }

  const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'certs/cert.pem')
  const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'certs/key.pem')

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.warn('[server] Certificados não encontrados. Execute: npm run certs:generate')
    console.warn('[server] Iniciando em HTTP.')
    return http.createServer(app)
  }

  return https.createServer(
    {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    },
    app,
  )
}

async function startServer() {
  try {
    await connectDatabase()
    const server = createServerInstance()
    const protocol = server instanceof https.Server ? 'https' : 'http'

    server.listen(port, () => {
      console.info(`[server] API rodando em ${protocol}://localhost:${port}`)
    })
  } catch (error) {
    console.error('[server] Falha ao iniciar. Verifique o PostgreSQL e o arquivo .env')
    console.error(error.message)
    process.exit(1)
  }
}

startServer()
