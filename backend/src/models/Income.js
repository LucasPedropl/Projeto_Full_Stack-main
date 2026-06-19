import pool from '../config/database.js'

export class Income {
  static async search({ userId, category, description, startDate, endDate }) {
    const conditions = ['user_id = $1']
    const values = [userId]
    let index = 2

    if (category) {
      conditions.push(`category = $${index}`)
      values.push(category)
      index += 1
    }

    if (description) {
      conditions.push(`description ILIKE $${index}`)
      values.push(`%${description}%`)
      index += 1
    }

    if (startDate) {
      conditions.push(`date >= $${index}`)
      values.push(startDate)
      index += 1
    }

    if (endDate) {
      conditions.push(`date <= $${index}`)
      values.push(endDate)
      index += 1
    }

    const query = `
      SELECT id, description, value, category, date, created_at
      FROM incomes
      WHERE ${conditions.join(' AND ')}
      ORDER BY date DESC, created_at DESC
    `

    const result = await pool.query(query, values)
    return result.rows
  }

  static async create({ userId, description, value, category, date }) {
    const result = await pool.query(
      `INSERT INTO incomes (user_id, description, value, category, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, description, value, category, date, created_at`,
      [userId, description, value, category, date],
    )

    return result.rows[0]
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM incomes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId],
    )

    return result.rows[0] || null
  }

  static async getDashboardSummary(userId) {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(value), 0)::float AS total_income,
         COALESCE(SUM(value) FILTER (
           WHERE date >= date_trunc('month', CURRENT_DATE)
             AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
         ), 0)::float AS month_income,
         COUNT(*) FILTER (
           WHERE date >= date_trunc('month', CURRENT_DATE)
             AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
         )::int AS month_income_count
       FROM incomes
       WHERE user_id = $1`,
      [userId],
    )

    const byCategory = await pool.query(
      `SELECT category, COALESCE(SUM(value), 0)::float AS total
       FROM incomes
       WHERE user_id = $1
         AND date >= date_trunc('month', CURRENT_DATE)
         AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
       GROUP BY category
       ORDER BY total DESC`,
      [userId],
    )

    const recent = await pool.query(
      `SELECT id, description, value, category, date, created_at
       FROM incomes
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC
       LIMIT 5`,
      [userId],
    )

    const row = result.rows[0]

    return {
      totalIncome: row.total_income,
      monthIncome: row.month_income,
      monthIncomeCount: row.month_income_count,
      incomeByCategory: byCategory.rows,
      recentIncomes: recent.rows,
    }
  }
}
