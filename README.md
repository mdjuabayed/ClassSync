# ClassSync

A small full-stack web app for **one university class**: the weekly class routine, exam schedule and academic announcements in one place — instead of scrolling through Facebook groups and WhatsApp messages.

**Status: all 7 stages complete.** React frontend · Express REST API · PostgreSQL database · login & authorization · automatic change history.

## Features

**Everyone (no login needed — student view is the landing page):**
- Weekly routine with course, teacher, day/date, time and room
- Clear **Scheduled / Cancelled / Rescheduled** labels (rescheduled classes show the old time struck through)
- Upcoming exams with dates, times, halls and countdown chips
- Announcement feed (newest first)
- **Recent changes** — every schedule change with its action, previous/new values, who did it and when

**Class Representative (login required at `/cr`):**
- Add / edit / delete class routine entries, **cancel a class with one click**
- Add / edit / delete exams
- Publish / delete announcements
- A confirmation dialog before every destructive action
- Success and error messages after each operation

**Security (enforced on the backend, not just hidden buttons):**
- All write endpoints (`POST`/`PUT`/`DELETE`) require a valid **CR session** — students and anonymous visitors get `401`/`403`, even calling the API directly with curl
- Passwords stored as **bcrypt hashes**; sessions are **JWTs in an httpOnly cookie**
- All SQL is **parameterized** (`$1`, `$2`, …) — no SQL injection
- Secrets live only in `.env` (gitignored); `.env.example` ships with placeholders

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (JavaScript, no TypeScript), Vite, react-router-dom, plain CSS |
| Backend | Node.js 24, Express 5 |
| Database | PostgreSQL 17 (via the `pg` driver) |
| Auth | `bcryptjs` (hashing) + `jsonwebtoken` (httpOnly cookie) |
| Version control | Git, one commit per stage |

## Project structure

```
ClassSync/
├── frontend/                      # React app (Vite)
│   ├── index.html
│   ├── vite.config.js             # dev server + proxy: /api → localhost:5000
│   └── src/
│       ├── main.jsx               # entry: mounts App, imports the 4 CSS files
│       ├── App.jsx                # layout + route table (URL → page)
│       ├── api.js                 # fetch wrapper: apiGet/apiPost/apiPut/apiDelete
│       ├── hooks/useApi.js        # { data, loading, error, refetch } for any endpoint
│       ├── utils/time.js          # all date/time formatting in one place
│       ├── index.css              # colors (CSS variables) + shared UI
│       ├── navbar.css / pages.css / cr.css
│       ├── components/            # Navbar, StatusBadge, Loading/Empty/Error,
│       │                          # ConfirmDialog, ClassForm, ExamForm,
│       │                          # AnnouncementForm, LoginForm
│       └── pages/                 # Dashboard, ClassRoutine, Exams,
│                                  # Announcements, CrDashboard
├── backend/
│   ├── .env                       # PORT, DATABASE_URL, JWT_SECRET (gitignored!)
│   ├── .env.example               # committed template, no real secrets
│   ├── db/
│   │   ├── schema.sql             # 5 tables: PKs, FKs, CHECKs, indexes
│   │   ├── seed.js                # npm run db:seed → schema + demo data
│   │   └── start-embedded.js      # npm run db:start → local PostgreSQL
│   └── src/
│       ├── server.js              # reads .env, starts listening on PORT
│       ├── app.js                 # middleware → routes → 404 → error handler
│       ├── db.js                  # pg connection pool + DATE/TIME type parsers
│       ├── middleware/auth.js     # requireCR — the authorization wall
│       ├── lib/validate.js        # input validation for writes
│       ├── lib/changes.js         # recordChange() + row describers
│       └── routes/                # classes, exams, announcements, changes, auth
└── README.md
```

## How data travels (React → Express → PostgreSQL)

Every page uses the same 4-step chain. Example: the Class Routine page.

```
1. React                 ClassRoutine.jsx calls useApi('/api/classes')
                             ↓
2. fetch (same origin)   Vite proxy forwards /api/* → http://localhost:5000
                             ↓
3. Express               router.get('/') in routes/classes.routes.js runs:
                             ↓
4. PostgreSQL            await pool.query('SELECT * FROM classes WHERE day_of_week = $1', [day])
                         → rows come back as JSON (res.json(rows))
                             ↓
5. React                 useApi stores { data, loading:false } → page renders
```

- **Placeholders like `$1`** mean the value is sent *separately from the SQL text*, so the database treats it purely as data — that is what prevents SQL injection.
- **Errors**: a thrown error (or bad input → `400`) always comes back as JSON `{"error": "message"}`, which `api.js` turns into an `Error`, which `useApi` stores in `error`, which the page shows with `<ErrorNotice>`.
- **Writes** follow the same path plus `requireCR` middleware (verifies the session cookie) and a `recordChange()` INSERT into `change_history`.

## Prerequisites

- **Node.js 18+** (tested on Node 24) and npm
- PostgreSQL — *either* a normal installation **or nothing** (see Path A)

## Setup

### Path A — no PostgreSQL installed (used on this machine)

The backend ships a **dev-only helper** that runs genuine PostgreSQL server
binaries as a normal user (no admin rights), via the `embedded-postgres`
dev dependency. The app itself only talks to `DATABASE_URL` — it does not
know or care which server is behind it.

```bash
cd backend
npm install            # first time only

npm run db:start       # Terminal 1: start the local PostgreSQL server
                       # (data is stored in backend/.data — gitignored)
npm run db:seed        # Terminal 2 (once): apply schema.sql + insert demo data
```

### Path B — you already have PostgreSQL installed

```bash
createdb classsync     # or: psql -c "CREATE DATABASE classsync;"
cd backend
npm install
# edit .env → DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/classsync
npm run db:seed        # apply schema + demo data
```

### Run the app (3 terminals)

```bash
# Terminal 1 — database (Path A only; skip if PostgreSQL already runs)
cd backend && npm run db:start

# Terminal 2 — API on http://localhost:5000
cd backend && npm run dev        # auto-restarts on file changes (node --watch)

# Terminal 3 — frontend on http://localhost:5173
cd frontend && npm run dev
```

Open **http://localhost:5173** — the student dashboard is the landing page.

### Demo accounts (local testing only — published on purpose)

| Role | Email | Password |
|---|---|---|
| **CR** (can manage everything) | `cr@classsync.test` | `cr1234` |
| Student (read-only) | `student@classsync.test` | `student123` |

Students don't need to log in at all — the whole site is readable without an account.

## Testing checklist

**Student view**
1. `/` shows 3 stat cards + today's classes, upcoming exams, latest announcements, recent changes (spinner first, then data from PostgreSQL).
2. `/routine` — Monday's Database Systems is labelled **Cancelled** with its reason; Tuesday's Computer Networks is **Rescheduled** with the old time struck through.
3. `/exams` — soonest first, countdown chips ("In 17 days" / "Tomorrow").
4. Narrow the window below 720 px → hamburger menu.

**CR flow**
5. `/cr` without login → sign-in form.
6. Sign in as the CR → management lists appear with a "Signed in as … (CR)" bar.
7. Add a class → green flash + row appears (check `/routine` as a student — it's there).
8. Edit it → "Recent changes" on the dashboard now shows *Updated class* with previous → new values.
9. Click **Cancel** on a class → confirmation dialog → badge turns red everywhere.
10. **Delete** anything → confirmation dialog → row disappears, history records it.
11. Sign in as the **student** on `/cr` → permission message, no buttons.

**API security (PowerShell/curl)**
```bash
curl http://localhost:5000/api/classes            # 200 — reads are public
curl -X POST http://localhost:5000/api/classes    # 401 — no session
# with a student session: 403; with CR session + valid JSON body: 201
curl "http://localhost:5000/api/classes?day=Funday"   # 400 + helpful message
curl http://localhost:5000/api/classes/99999          # 404 + JSON error
```

**Reset the demo data any time:** `cd backend && npm run db:seed`
(drops + recreates the tables and re-inserts the fictional seed rows).

## API reference

Auth column: **public** = anyone · **CR** = valid session cookie with role `cr`.
Errors are always JSON `{"error": "message"}` with status 400 / 401 / 403 / 404 / 500.

| Method | URL | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | public | `{status:"ok",time}` — liveness check |
| GET | `/api/classes` | public | full routine, optional `?day=Monday`, ordered Sun→Sat |
| GET | `/api/classes/:id` | public | single entry |
| POST | `/api/classes` | **CR** | validated → `201` + new row |
| PUT | `/api/classes/:id` | **CR** | full update → `200` |
| DELETE | `/api/classes/:id` | **CR** | → `{ok:true,id}` |
| POST | `/api/classes/:id/cancel` | **CR** | one-click cancel (row kept, status flipped) |
| GET | `/api/exams` | public | soonest first |
| GET | `/api/exams/:id` | public | single exam |
| POST / PUT / DELETE | `/api/exams(/:id)` | **CR** | validated; `201` / `200` |
| GET | `/api/announcements` | public | newest first, `author_name` joined from `users` |
| GET | `/api/announcements/:id` | public | |
| POST | `/api/announcements` | **CR** | author = session user (never the request body) |
| DELETE | `/api/announcements/:id` | **CR** | |
| GET | `/api/changes` | public | newest first, `changed_by` joined from `users` |
| GET | `/api/changes/:id` | public | |
| POST | `/api/auth/login` | public | `{email,password}` → sets httpOnly `session` cookie (8 h) |
| POST | `/api/auth/logout` | public | clears the cookie |
| GET | `/api/auth/me` | public | `{user:{id,name,role}}` or `{user:null}` |

## Database schema (`backend/db/schema.sql`)

| Table | Purpose | Keys / constraints |
|---|---|---|
| `users` | accounts with `role` = `student` \| `cr` | PK `id`, UNIQUE `email`, CHECK on `role`, bcrypt `password_hash` |
| `classes` | weekly routine slots + status | PK, CHECK `day_of_week`/`status`, CHECK `end_time > start_time`, `updated_at` |
| `exams` | exam/quiz rows | PK, CHECK `end_time > start_time`, DATE + TIME columns |
| `announcements` | notices | PK, FK `author_id → users` ON DELETE SET NULL |
| `change_history` | audit trail: action, subject, previous/new values, who, when | PK, FK `changed_by → users`, index on `changed_at` |

## Environment variables (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `DATABASE_URL` | PostgreSQL connection string — the only DB credential the app reads |
| `JWT_SECRET` | signs session tokens; generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

`.env` is gitignored (verified with `git check-ignore`). **Never** commit it.
No secret exists in source code, and nothing database-related reaches the
frontend — React only ever sees JSON from `/api/*`.

## Security notes & known prototype limitations

Already enforced: backend authorization on every write route · parameterized
SQL everywhere · bcrypt password hashing · httpOnly + SameSite=Lax session
cookie · generic 500 responses (no stack traces leaked) · identical "invalid
email or password" message for both failure cases · server-side validation
with helpful 400s · malformed JSON rejected with 400.

Documented limitations of this **teaching prototype** (address before real use):
- `secure: false` on the cookie — must be `true` behind HTTPS in production.
- Logout clears the cookie only; the signed token stays valid until it
  expires after 8 hours (stateless JWT trade-off — no server-side revocation).
- No rate limiting / CSRF tokens / security headers (helmet).
- Demo passwords are published in this README and the seed script.
- The embedded dev database uses the local password from `.env`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ECONNREFUSED ...:5432` | Database not running → `cd backend && npm run db:start` (Path A) or start your service (Path B) |
| `database "classsync" does not exist` | Run `npm run db:seed` once |
| `Port 5000/5173 is already in use` | A previous dev server is still running → close it, or change `PORT` / the vite `--port` flag |
| Test rows left in the UI | `npm run db:seed` resets everything to the fictional demo data |
| Login always fails | Check `JWT_SECRET` exists in `backend/.env`; check the demo passwords above |
| Completely fresh database | Stop the server, delete `backend/.data/`, then `db:start` + `db:seed` |

## Development history (one commit per stage)

| Stage | Commit | What it added |
|---:|---|---|
| 1 | `5b109bf` | React student dashboard with mock data |
| 2 | `28bc93a` | Express server + read-only REST API |
| 3 | `54725b6` | PostgreSQL schema, seed script, backend reads the database |
| 4 | `f65e361` | React fetches the real API through the Vite proxy |
| 5 | `4cf01fa` | CR operations + management dashboard + confirmations |
| 6 | `413b917` | Authentication, backend authorization, automatic change history |
| 7 | final commit | Full end-to-end testing + this documentation |

## Intentionally out of scope (per the project brief)

Single class/batch only · no AI features · no payments · no messaging or
push notifications · no TypeScript · no extra frameworks or abstraction layers.
