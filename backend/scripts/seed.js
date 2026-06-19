import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import pool from '../src/config/database.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seed() {
  await connectDatabase()

  const schemaPath = path.join(__dirname, '../database/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  await pool.query(schema)

  const passwordHash = await bcrypt.hash('admin123', 10)

  await pool.query(
    `INSERT INTO users (email, password_hash, name, plan)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name = EXCLUDED.name,
       plan = EXCLUDED.plan
     RETURNING id`,
    ['admin@gastometer.com', passwordHash, 'Administrador', 'pro'],
  )

  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    ['admin@gastometer.com'],
  )
  const userId = userResult.rows[0]?.id

  if (userId) {
    await pool.query(
      `INSERT INTO incomes (user_id, description, value, category, date)
       SELECT $1, 'Salário mensal', 8500.00, 'salary', CURRENT_DATE
       WHERE NOT EXISTS (
         SELECT 1 FROM incomes WHERE user_id = $1 AND description = 'Salário mensal'
       )`,
      [userId],
    )

    await pool.query(
      `INSERT INTO incomes (user_id, description, value, category, date)
       SELECT $1, 'Projeto freelance', 2200.00, 'freelance', CURRENT_DATE - INTERVAL '3 days'
       WHERE NOT EXISTS (
         SELECT 1 FROM incomes WHERE user_id = $1 AND description = 'Projeto freelance'
       )`,
      [userId],
    )
  }

  console.info('[seed] Banco inicializado com sucesso.')
  console.info('[seed] Usuário: admin@gastometer.com | Senha: admin123')
  await disconnectDatabase()
}

seed().catch((error) => {
  console.error('[seed] Falha ao popular o banco:', error.message)
  process.exit(1)
})
