// src/routes/auth.routes.js — login / logout / current session.
//
// Approach (documented prototype auth):
//   * passwords are stored as bcrypt HASHES (never plain text)
//   * on login we sign a short-lived JWT and send it as an httpOnly cookie
//     (JavaScript in the browser cannot read httpOnly cookies → XSS-safe)
//   * every protected route re-verifies the token in middleware/auth.js
//   * JWT_SECRET lives ONLY in .env, never in source code
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()

const TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000 // session lasts 8 hours

// POST /api/auth/login  { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.trim() === '' ||
    password === ''
  ) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  if (!process.env.JWT_SECRET) {
    // Fail loudly instead of signing tokens with an empty secret
    return res
      .status(500)
      .json({ error: 'Server misconfigured: JWT_SECRET is missing in .env' })
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
    email.trim().toLowerCase(),
  ])
  const user = rows[0]

  // SAME message for "unknown email" and "wrong password" on purpose,
  // so the API does not reveal which email addresses exist.
  const passwordMatches = user
    ? await bcrypt.compare(password, user.password_hash)
    : false

  if (!user || !passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  )

  res.cookie('session', token, {
    httpOnly: true, // not readable from JavaScript (XSS protection)
    sameSite: 'lax', // sent on normal requests, blocked on cross-site POSTs
    secure: false, // set to true behind HTTPS in production
    maxAge: TOKEN_MAX_AGE_MS,
  })

  return res.json({
    user: { id: user.id, name: user.name, role: user.role },
  })
})

// POST /api/auth/logout — clears the cookie (the token itself simply
// expires after 8 hours; stateless tokens cannot be revoked server-side)
router.post('/logout', (req, res) => {
  res.clearCookie('session')
  return res.json({ ok: true })
})

// GET /api/auth/me — who am I? Always 200: { user } or { user: null }
router.get('/me', (req, res) => {
  const token = req.cookies && req.cookies.session
  if (!token) return res.json({ user: null })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({
      user: { id: payload.id, name: payload.name, role: payload.role },
    })
  } catch {
    return res.json({ user: null })
  }
})

export default router
