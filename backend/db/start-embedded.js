// db/start-embedded.js — starts a local PostgreSQL server WITHOUT admin rights.
//
// Why this exists: machines without a PostgreSQL installation can still run
// the app. It uses the `embedded-postgres` dev dependency (real PostgreSQL
// server binaries shipped through npm) and configures everything from
// DATABASE_URL in ../.env — no credentials are written in this file.
//
// If you already have PostgreSQL installed, simply create a database, set
// DATABASE_URL and skip this script entirely — the app does not care which
// server it talks to.
//
// Run:  npm run db:start     (leave the terminal open; Ctrl+C stops it)

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import EmbeddedPostgres from 'embedded-postgres'

dotenv.config({ quiet: true }) // reads backend/.env

const url = new URL(process.env.DATABASE_URL)

const settings = {
  // Data lives in backend/.data (gitignored) so it survives restarts
  databaseDir: fileURLToPath(new URL('../.data/', import.meta.url)),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  port: Number(url.port) || 5432,
  persistent: true,
}

const db = new EmbeddedPostgres(settings)

// initialise() runs "initdb" — only needed for the very first run
if (!fs.existsSync(settings.databaseDir)) {
  console.log('First run: creating the PostgreSQL data folder…')
  await db.initialise()
}

console.log(`Starting PostgreSQL on port ${settings.port}…`)
await db.start()

const databaseName = url.pathname.replace(/^\//, '') || 'classsync'
try {
  await db.createDatabase(databaseName)
  console.log(`Created database "${databaseName}".`)
} catch {
  console.log(`Database "${databaseName}" already exists.`)
}

console.log('PostgreSQL is ready — keep this terminal open while using ClassSync.')

// The server runs as a child process; this timer tells Node to stay alive
// and keep supervising it until you press Ctrl+C.
setInterval(() => {}, 60 * 60 * 1000)
