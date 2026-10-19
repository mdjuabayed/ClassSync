// Routes for exams. Mounted at /api/exams.

import { Router } from 'express'
import { exams } from '../data/mockStore.js'

const router = Router()

// GET /api/exams — soonest exam first
router.get('/', (req, res) => {
  const sorted = [...exams].sort((a, b) =>
    a.exam_date.localeCompare(b.exam_date),
  )
  return res.json(sorted)
})

// GET /api/exams/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Exam id must be a number' })
  }

  const exam = exams.find((item) => item.id === id)
  if (!exam) {
    return res.status(404).json({ error: `Exam ${id} not found` })
  }

  return res.json(exam)
})

export default router
