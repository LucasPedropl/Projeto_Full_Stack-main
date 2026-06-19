import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import selfsigned from 'selfsigned'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const certsDir = path.join(__dirname, '../certs')

const attrs = [{ name: 'commonName', value: 'localhost' }]
const options = { days: 365, keySize: 2048, algorithm: 'sha256' }
const pems = selfsigned.generate(attrs, options)

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true })
}

fs.writeFileSync(path.join(certsDir, 'key.pem'), pems.private)
fs.writeFileSync(path.join(certsDir, 'cert.pem'), pems.cert)

console.info('[certs] Certificados gerados em backend/certs/')
console.info('[certs] Defina USE_HTTPS=true no .env para ativar HTTPS.')
