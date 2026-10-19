// app.js — builds and configures the Express application.
// Order matters:
//   1) middleware  (run for every request, in order)
//   2) routes      (match a URL → send a response)
//   3) 404 handler (runs when no route matched)
//   4) error handler (catches any error passed to next(err) — must be last)

import express from 'express'
import classesRouter from './routes/classes.routes.js'
import examsRouter from './routes/exams.routes.js'
import announcementsRouter from './routes/announcements.routes.js'
import changesRouter from './routes/changes.routes.js'

const app = express()

// ---------- 1) global middleware ----------

// express.json() reads JSON request bodies (needed later in Stage 5 when the
// CR dashboard sends { ... } objects with POST/PUT requests).
app.use(express.json())

// Tiny request logger — shows middleware in action without extra packages.
// next("next") is what hands control to the NEXT middleware/route.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`)
  next()
})

// ---------- 2) routes ----------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/classes', classesRouter)
app.use('/api/exams', examsRouter)
app.use('/api/announcements', announcementsRouter)
app.use('/api/changes', changesRouter)

// ---------- 3) 404 for unknown routes ----------
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// ---------- 4) error handler ----------
// Express treats ANY function with 4 parameters as an error handler.
// Any thrown error or next(err) ends up here, so one broken route
// can never crash the whole server or send an ugly HTML stack trace.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
