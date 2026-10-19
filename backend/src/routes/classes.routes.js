// Routes for the class routine.
// Mounted in app.js at /api/classes, so:
//   GET /api/classes          -> this file, router.get('/')
//   GET /api/classes/:id      -> this file, router.get('/:id')

import { Router } from 'express'
import { classes, WEEK_DAY_NAMES } from '../data/mockStore.js'

const router = Router()

// GET /api/classes
// Optional filter by weekday:  /api/classes?day=Monday
router.get('/', (req, res) => {
  const { day } = req.query

  // No filter -> return everything
  if (day === undefined) {
    return res.json(classes)
  }

  // Bad input gets a 400 with a helpful message (validation!)
  if (!WEEK_DAY_NAMES.includes(day)) {
    return res.status(400).json({
      error: `Invalid day "${day}". Use one of: ${WEEK_DAY_NAMES.join(', ')}`,
    })
  }

  const filtered = classes.filter((entry) => entry.day_of_week === day)
  return res.json(filtered)
})

// GET /api/classes/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Class id must be a number' })
  }

  const entry = classes.find((item) => item.id === id)
  if (!entry) {
    return res.status(404).json({ error: `Class entry ${id} not found` })
  }

  return res.json(entry)
})

export default router
