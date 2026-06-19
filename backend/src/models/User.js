import pool from '../config/database.js'

export class User {
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, email, password_hash, name, plan, created_at FROM users WHERE email = $1 LIMIT 1',
      [email],
    )

    return result.rows[0] || null
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, name, plan, created_at FROM users WHERE id = $1 LIMIT 1',
      [id],
    )

    return result.rows[0] || null
  }

  static async create({ email, passwordHash, name, plan = 'starter' }) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, plan)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, plan, created_at`,
      [email, passwordHash, name, plan],
    )

    return result.rows[0]
  }

  static async updateProfile(id, { name, email, passwordHash }) {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           password_hash = COALESCE($4, password_hash)
       WHERE id = $1
       RETURNING id, email, name, plan, created_at`,
      [id, name ?? null, email ?? null, passwordHash ?? null],
    )

    return result.rows[0] || null
  }

  static toPublic(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      createdAt: user.created_at,
    }
  }
}
