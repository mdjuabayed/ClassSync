// Routes for the change history (update log). Mounted at /api/changes.

import { Router } from 'express'
import { changeHistory } from '../data/mockStore.js'

const router = Router()

// GET /api/changes — most recent change first
router.get('/', (req, res) => {
  const sorted = [...changeHistory].sort(
    (a, b) => new Date(b.changed_at) - new Date(a.changed_at),
  )
  return res.json(sorted)
})

// GET /api/changes/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Change id must be a number' })
  }

  const change = changeHistory.find((item) => item.id === id)
  if (!change) {
    return res.status(404).json({ error: `Change entry ${id} not found` })
  }

  return res.json(change)
})

export default router
