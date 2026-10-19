// Routes for the class routine.
// Mounted in app.js at /api/classes, so:
//   GET /api/classes          -> this file, router.get('/')
//   GET /api/classes/:id      -> this file, router.get('/:id')

import { Router } from 'express'
import pool from '../db.js'
import {
  validateClassBody,
  emptyToNull,
} from '../lib/validate.js'

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

// ---------------------------------------------------------------------------
// POST /api/classes — create one routine entry (201 + the new row)
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  const body = req.body || {}

  const errors = validateClassBody(body)
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') })
  }

  const { rows } = await pool.query(
    `INSERT INTO classes (course_code, course_name, teacher_name, day_of_week,
                          start_time, end_time, room_number, status, status_note,
                          original_start_time, original_end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      body.course_code.trim(),
      body.course_name.trim(),
      body.teacher_name.trim(),
      body.day_of_week,
      body.start_time,
      body.end_time,
      body.room_number.trim(),
      body.status || 'scheduled',
      emptyToNull(body.status_note),
      body.original_start_time || null,
      body.original_end_time || null,
    ],
  )
  return res.status(201).json(rows[0])
})

// ---------------------------------------------------------------------------
// PUT /api/classes/:id — replace every field of one entry
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Class id must be a number' })
  }

  const { rows: existing } = await pool.query(
    'SELECT id FROM classes WHERE id = $1',
    [id],
  )
  if (existing.length === 0) {
    return res.status(404).json({ error: `Class entry ${id} not found` })
  }

  const body = req.body || {}
  const errors = validateClassBody(body)
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') })
  }

  const { rows } = await pool.query(
    `UPDATE classes
     SET course_code = $1, course_name = $2, teacher_name = $3,
         day_of_week = $4, start_time = $5, end_time = $6, room_number = $7,
         status = $8, status_note = $9,
         original_start_time = $10, original_end_time = $11,
         updated_at = now()
     WHERE id = $12
     RETURNING *`,
    [
      body.course_code.trim(),
      body.course_name.trim(),
      body.teacher_name.trim(),
      body.day_of_week,
      body.start_time,
      body.end_time,
      body.room_number.trim(),
      body.status || 'scheduled',
      emptyToNull(body.status_note),
      body.original_start_time || null,
      body.original_end_time || null,
      id,
    ],
  )
  return res.json(rows[0])
})

// ---------------------------------------------------------------------------
// DELETE /api/classes/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Class id must be a number' })
  }

  const { rows } = await pool.query(
    'DELETE FROM classes WHERE id = $1 RETURNING id',
    [id],
  )
  if (rows.length === 0) {
    return res.status(404).json({ error: `Class entry ${id} not found` })
  }
  return res.json({ ok: true, id })
})

// ---------------------------------------------------------------------------
// POST /api/classes/:id/cancel — the one-click cancel button.
// Only flips the status (and optional note); the row is kept so students
// can still SEE that the class was cancelled.
// ---------------------------------------------------------------------------
router.post('/:id/cancel', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Class id must be a number' })
  }

  const { rows: existing } = await pool.query(
    'SELECT status FROM classes WHERE id = $1',
    [id],
  )
  if (existing.length === 0) {
    return res.status(404).json({ error: `Class entry ${id} not found` })
  }
  if (existing[0].status === 'cancelled') {
    return res.status(400).json({ error: 'Class is already cancelled' })
  }

  const note = emptyToNull(req.body && req.body.note)
  const { rows } = await pool.query(
    `UPDATE classes
     SET status = 'cancelled', status_note = $2, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, note],
  )
  return res.json(rows[0])
})

export default router
