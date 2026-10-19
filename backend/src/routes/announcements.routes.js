// Routes for announcements. Mounted at /api/announcements.

import { Router } from 'express'
import { announcements } from '../data/mockStore.js'

const router = Router()

// GET /api/announcements — newest first
router.get('/', (req, res) => {
  const sorted = [...announcements].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )
  return res.json(sorted)
})

// GET /api/announcements/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Announcement id must be a number' })
  }

  const announcement = announcements.find((item) => item.id === id)
  if (!announcement) {
    return res.status(404).json({ error: `Announcement ${id} not found` })
  }

  return res.json(announcement)
})

export default router
