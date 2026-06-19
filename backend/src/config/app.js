import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import authRoutes from '../routes/authRoutes.js'
import expenseRoutes from '../routes/expenseRoutes.js'
import dashboardRoutes from '../routes/dashboardRoutes.js'
import budgetRoutes from '../routes/budgetRoutes.js'
import incomeRoutes from '../routes/incomeRoutes.js'

const app = express()

app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gastometer-backend' })
})

app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/incomes', incomeRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' })
})

app.use((error, _req, res, _next) => {
  console.error('[server]', error)
  res.status(500).json({ message: 'Erro interno do servidor.' })
})

export default app
