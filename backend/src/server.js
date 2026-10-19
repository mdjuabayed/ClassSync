// server.js — the entry point of the backend.
// Its only jobs: load environment variables, then start listening on a port.
// (Everything about middleware and routes lives in app.js.)

import dotenv from 'dotenv'

// Read the .env file in the backend folder BEFORE process.env is used.
// quiet: true keeps the terminal free of dotenv's own log messages.
dotenv.config({ quiet: true })

import app from './app.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`ClassSync API running at http://localhost:${PORT}`)
  console.log(`Try: http://localhost:${PORT}/api/health`)
})
