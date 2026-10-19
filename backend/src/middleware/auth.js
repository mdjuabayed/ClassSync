// src/middleware/auth.js — backend authorization.
//
// requireCR guards EVERY route that changes data. It is the server-side
// wall: even if someone hides nothing in the UI and calls the API directly
// with curl, they still need a valid CR session cookie.
//
// Students never pass this middleware — they can only READ (GET routes).
import jwt from 'jsonwebtoken'

export function requireCR(req, res, next) {
  const token = req.cookies && req.cookies.session

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Login required — please sign in as the CR.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    if (payload.role !== 'cr') {
      return res
        .status(403)
        .json({ error: 'Only the Class Representative can manage data.' })
    }

    req.user = payload // { id, name, role } — used for change history
    return next()
  } catch {
    return res
      .status(401)
      .json({ error: 'Your session is invalid or expired — sign in again.' })
  }
}
