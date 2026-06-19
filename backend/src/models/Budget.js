import pool from '../config/database.js'

export class Budget {
  static async listByUser(userId) {
    const result = await pool.query(
      `SELECT id, category, monthly_limit, created_at
       FROM budgets
       WHERE user_id = $1
       ORDER BY category ASC`,
      [userId],
    )

    return result.rows
  }

  static async upsert({ userId, category, monthlyLimit }) {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, monthly_limit)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category)
       DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit
       RETURNING id, category, monthly_limit, created_at`,
      [userId, category, monthlyLimit],
    )

    return result.rows[0]
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId],
    )

    return result.rows[0] || null
  }
}
