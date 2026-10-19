// Routes for the change history (update log). Mounted at /api/changes.

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/changes — most recent change first, with who made it
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.id, c.action, c.subject, c.previous_value, c.new_value,
            u.name AS changed_by, c.changed_at
     FROM change_history c
     LEFT JOIN users u ON u.id = c.changed_by
     ORDER BY c.changed_at DESC`,
  )
  return res.json(rows)
})

// GET /api/changes/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Change id must be a number' })
  }

  const { rows } = await pool.query(
    `SELECT c.id, c.action, c.subject, c.previous_value, c.new_value,
            u.name AS changed_by, c.changed_at
     FROM change_history c
     LEFT JOIN users u ON u.id = c.changed_by
     WHERE c.id = $1`,
    [id],
  )
  const change = rows[0]
  if (!change) {
    return res.status(404).json({ error: `Change entry ${id} not found` })
  }

  return res.json(change)
})

export default router
