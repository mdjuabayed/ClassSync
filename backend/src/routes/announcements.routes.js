// Routes for announcements. Mounted at /api/announcements.

import { Router } from 'express'
import pool from '../db.js'
import { isNonEmptyString } from '../lib/validate.js'

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

// POST /api/announcements — publish one announcement (201).
// author_id comes from the request body in Stage 5; Stage 6 replaces this
// with the logged-in CR from the session token.
router.post('/', async (req, res) => {
  const body = req.body || {}
  const errors = []

  if (!isNonEmptyString(body.title)) errors.push('title is required')
  if (body.title && body.title.length > 200) errors.push('title must be 200 characters or fewer')
  if (!isNonEmptyString(body.body)) errors.push('body is required')

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') })
  }

  const authorId =
    Number.isInteger(body.author_id) && body.author_id > 0 ? body.author_id : null

  const { rows } = await pool.query(
    `INSERT INTO announcements (title, body, author_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [body.title.trim(), body.body.trim(), authorId],
  )
  return res.status(201).json(rows[0])
})

// DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Announcement id must be a number' })
  }

  const { rows } = await pool.query(
    'DELETE FROM announcements WHERE id = $1 RETURNING id',
    [id],
  )
  if (rows.length === 0) {
    return res.status(404).json({ error: `Announcement ${id} not found` })
  }
  return res.json({ ok: true, id })
})

export default router
