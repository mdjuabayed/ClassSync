// db.js — the ONE place where the backend talks to PostgreSQL.
// Every route imports `pool` from here and runs parameterized queries.
import dotenv from 'dotenv'

// Load .env before the pool below reads DATABASE_URL.
dotenv.config({ quiet: true })

import pg from 'pg'

// ---------------------------------------------------------------------------
// Keep DATE and TIME columns as plain strings.
// Without this, node-postgres turns them into JavaScript Date objects, and
// JSON.stringify() would render them with a timezone attached
// ("2026-11-05" could arrive as "2026-11-04T18:00:00.000Z" in UTC+6) —
// shifting exam dates by a whole day. Strings keep the contract stable.
// ---------------------------------------------------------------------------
pg.types.setTypeParser(1082, (value) => value) // DATE   -> "2026-11-05"
pg.types.setTypeParser(1083, (value) => value.slice(0, 5)) // TIME -> "09:00"

// A Pool reuses database connections automatically — much faster than
// opening a new connection for every request.
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

// Friendly error when the database is unreachable (e.g. forgot npm run db:start)
pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message)
})

export default pool
