// Routes for the class routine.
// Mounted in app.js at /api/classes, so:
//   GET /api/classes          -> this file, router.get('/')
//   GET /api/classes/:id      -> this file, router.get('/:id')

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// Valid weekdays — must match the CHECK constraint in db/schema.sql
const WEEK_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

// GET /api/classes
// Optional filter by weekday:  /api/classes?day=Monday
router.get('/', async (req, res) => {
  const { day } = req.query

  // Bad input gets a 400 with a helpful message (validation!)
  if (day !== undefined && !WEEK_DAY_NAMES.includes(day)) {
    return res.status(400).json({
      error: `Invalid day "${day}". Use one of: ${WEEK_DAY_NAMES.join(', ')}`,
    })
  }

  // $1 is a placeholder: the value is sent separately from the SQL text,
  // so the database always treats it as DATA and never as SQL code.
  // That is what prevents SQL injection.
  // (Express 5 forwards any error thrown by this async handler to the
  //  error middleware in app.js, which answers with a JSON 500.)
  const { rows } = await pool.query(
    `SELECT * FROM classes
     WHERE ($1::text IS NULL OR day_of_week = $1)
     ORDER BY CASE day_of_week
       WHEN 'Sunday' THEN 1 WHEN 'Monday' THEN 2 WHEN 'Tuesday' THEN 3
       WHEN 'Wednesday' THEN 4 WHEN 'Thursday' THEN 5 WHEN 'Friday' THEN 6
       ELSE 7 END,
     start_time`,
    [day ?? null],
  )
  return res.json(rows)
})

// GET /api/classes/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Class id must be a number' })
  }

  const { rows } = await pool.query('SELECT * FROM classes WHERE id = $1', [
    id,
  ])
  const entry = rows[0]
  if (!entry) {
    return res.status(404).json({ error: `Class entry ${id} not found` })
  }

  return res.json(entry)
})

export default router
