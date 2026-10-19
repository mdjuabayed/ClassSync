// Routes for exams. Mounted at /api/exams.

import { Router } from 'express'
import pool from '../db.js'

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

export default router
