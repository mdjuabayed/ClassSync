// Routes for exams. Mounted at /api/exams.

import { Router } from 'express'
import pool from '../db.js'
import { validateExamBody } from '../lib/validate.js'

const router = Router()

// GET /api/exams — soonest exam first (sorted by the database)
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM exams ORDER BY exam_date, start_time',
  )
  return res.json(rows)
})

// GET /api/exams/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Exam id must be a number' })
  }

  const { rows } = await pool.query('SELECT * FROM exams WHERE id = $1', [id])
  const exam = rows[0]
  if (!exam) {
    return res.status(404).json({ error: `Exam ${id} not found` })
  }

  return res.json(exam)
})

// POST /api/exams — create one exam (201)
router.post('/', async (req, res) => {
  const body = req.body || {}

  const errors = validateExamBody(body)
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') })
  }

  const { rows } = await pool.query(
    `INSERT INTO exams (course_code, course_name, exam_type, exam_date,
                        start_time, end_time, room_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      body.course_code.trim(),
      body.course_name.trim(),
      body.exam_type.trim(),
      body.exam_date,
      body.start_time,
      body.end_time,
      body.room_number.trim(),
    ],
  )
  return res.status(201).json(rows[0])
})

// PUT /api/exams/:id — replace every field of one exam
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Exam id must be a number' })
  }

  const { rows: existing } = await pool.query(
    'SELECT id FROM exams WHERE id = $1',
    [id],
  )
  if (existing.length === 0) {
    return res.status(404).json({ error: `Exam ${id} not found` })
  }

  const body = req.body || {}
  const errors = validateExamBody(body)
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') })
  }

  const { rows } = await pool.query(
    `UPDATE exams
     SET course_code = $1, course_name = $2, exam_type = $3, exam_date = $4,
         start_time = $5, end_time = $6, room_number = $7, updated_at = now()
     WHERE id = $8
     RETURNING *`,
    [
      body.course_code.trim(),
      body.course_name.trim(),
      body.exam_type.trim(),
      body.exam_date,
      body.start_time,
      body.end_time,
      body.room_number.trim(),
      id,
    ],
  )
  return res.json(rows[0])
})

// DELETE /api/exams/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Exam id must be a number' })
  }

  const { rows } = await pool.query(
    'DELETE FROM exams WHERE id = $1 RETURNING id',
    [id],
  )
  if (rows.length === 0) {
    return res.status(404).json({ error: `Exam ${id} not found` })
  }
  return res.json({ ok: true, id })
})

export default router
