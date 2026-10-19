// Routes for announcements. Mounted at /api/announcements.

import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/announcements — newest first, with the author's name joined in
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT a.id, a.title, a.body, u.name AS author_name, a.created_at
     FROM announcements a
     LEFT JOIN users u ON u.id = a.author_id
     ORDER BY a.created_at DESC`,
  )
  return res.json(rows)
})

// GET /api/announcements/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Announcement id must be a number' })
  }

  const { rows } = await pool.query(
    `SELECT a.id, a.title, a.body, u.name AS author_name, a.created_at
     FROM announcements a
     LEFT JOIN users u ON u.id = a.author_id
     WHERE a.id = $1`,
    [id],
  )
  const announcement = rows[0]
  if (!announcement) {
    return res.status(404).json({ error: `Announcement ${id} not found` })
  }

  return res.json(announcement)
})

export default router
