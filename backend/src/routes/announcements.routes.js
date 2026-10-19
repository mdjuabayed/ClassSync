// Routes for announcements.
// GET is public; POST/DELETE require a CR session (Stage 6).
// The author is taken from the SESSION, never from the request body —
// a client cannot pretend to be someone else.
import { Router } from 'express'
import pool from '../db.js'
import { requireCR } from '../middleware/auth.js'
import { recordChange } from '../lib/changes.js'
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

// GET /api/announcements/:id — one announcement
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

// POST /api/announcements — publish one announcement (201)
router.post('/', requireCR, async (req, res) => {
  const body = req.body || {}
  const errors = []

  if (!isNonEmptyString(body.title)) errors.push('title is required')
  if (body.title && body.title.length > 200) {
    errors.push('title must be 200 characters or fewer')
  }
  if (!isNonEmptyString(body.body)) errors.push('body is required')

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') })
  }

  const { rows } = await pool.query(
    `INSERT INTO announcements (title, body, author_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [body.title.trim(), body.body.trim(), req.user.id],
  )
  const created = rows[0]

  await recordChange({
    action: 'Published announcement',
    subject: created.title,
    previousValue: null,
    newValue: 'Visible to all students',
    userId: req.user.id,
  })

  return res.status(201).json(created)
})

// DELETE /api/announcements/:id
router.delete('/:id', requireCR, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Announcement id must be a number' })
  }

  const { rows: existing } = await pool.query(
    'SELECT id, title FROM announcements WHERE id = $1',
    [id],
  )
  if (existing.length === 0) {
    return res.status(404).json({ error: `Announcement ${id} not found` })
  }
  const before = existing[0]

  await pool.query('DELETE FROM announcements WHERE id = $1', [id])

  await recordChange({
    action: 'Deleted announcement',
    subject: before.title,
    previousValue: 'Visible to all students',
    newValue: null,
    userId: req.user.id,
  })

  return res.json({ ok: true, id })
})

export default router