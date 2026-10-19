# ClassSync

A small full-stack web app for **one university class**: the weekly class routine, exam schedule and academic announcements in one place — instead of scrolling through Facebook groups and WhatsApp messages.

**Current status: Stage 2 of 7 complete** — the student frontend (with mock data) **and** the Express REST API (with a temporary mock store) are working. The database, the frontend↔API connection, the CR dashboard and login are added in the following stages (see Roadmap).

## Tech stack

- **Frontend:** React (JavaScript) + Vite
- **Backend:** Node.js + Express — REST API (Stage 2)
- **Database:** PostgreSQL _(Stage 3)_
- **Styling:** plain CSS (no frameworks)

## Project structure

```
ClassSync/
├── frontend/                  # React app (Stage 1)
│   ├── index.html             # the single HTML page React renders into
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx           # entry point: mounts <App/>, imports CSS
│       ├── App.jsx            # layout + route table (URL → page)
│       ├── index.css          # colors (CSS variables) + shared UI styles
│       ├── navbar.css         # navigation bar styles
│       ├── pages.css          # page-specific styles
│       ├── data/mockData.js   # temporary fake data (replaced by API in Stage 4)
│       ├── hooks/useMockFetch.js  # simulates fetch(): { data, loading, error }
│       ├── utils/time.js      # date/time formatting helpers
│       ├── components/        # Navbar, StatusBadge, Loading/Empty/Error
│       └── pages/             # Dashboard, ClassRoutine, Exams, Announcements
├── backend/                   # Express REST API (Stage 2)
│   ├── .env.example           # committed template — no real secrets
│   ├── .env                   # local settings (PORT=5000) — gitignored
│   └── src/
│       ├── server.js          # loads .env, starts app.listen(PORT)
│       ├── app.js             # middleware → routes → 404 → error handler
│       ├── data/mockStore.js  # ⚠ temporary data (replaced by SQL in Stage 3)
│       └── routes/            # classes, exams, announcements, changes
├── .gitignore
└── README.md
```

## How to run

Requirements: **Node.js 18+** and npm.

### Frontend (student UI)

```bash
cd frontend
npm install        # first time only — downloads dependencies
npm run dev        # starts the dev server
```

Open **http://localhost:5173** in your browser.

### Backend API (Stage 2)

```bash
cd backend
npm install        # first time only
npm run dev        # starts with auto-restart on file changes (node --watch)
```

Open **http://localhost:5000/api/health** — you should see `{"status":"ok",...}`.

### API endpoints

| Method | URL | Returns |
|---|---|---|
| GET | `/api/health` | server status + current time |
| GET | `/api/classes` | all class entries (optional `?day=Monday`) |
| GET | `/api/classes/:id` | one class entry |
| GET | `/api/exams` | exams, soonest first |
| GET | `/api/exams/:id` | one exam |
| GET | `/api/announcements` | announcements, newest first |
| GET | `/api/announcements/:id` | one announcement |
| GET | `/api/changes` | change history, newest first |
| GET | `/api/changes/:id` | one history entry |

Errors always return JSON: `{"error": "message"}` with status **400** (bad input), **404** (not found) or **500** (server error).

Other useful commands (run inside `frontend/`):

```bash
npm run build      # production build into frontend/dist
npm run preview    # preview the production build
```

## Testing checklist

### Frontend (Stage 1)

1. **Dashboard** is the landing page at `/` and shows 3 stat cards plus 4 sections:
   today's classes, upcoming exams, latest announcements, recent changes.
2. For ~0.6 seconds you see a **loading spinner** before content appears
   (this simulates a real network request).
3. On **Class Routine**, Monday's *Database Systems* class is labelled
   **Cancelled** (red) with the teacher's reason underneath.
4. Tuesday's *Computer Networks* class is labelled **Rescheduled** (amber):
   the old 9:00 AM time is struck through and the new 3:00 PM time is shown.
5. All four nav links work and the current one is highlighted.
6. Resize the browser below ~720 px → the links collapse into a **hamburger menu**.
7. Empty states are easy to see by temporarily deleting all entries in
   `src/data/mockData.js` (e.g. `classSchedule = []`) — the page shows a friendly
   "No classes today / No routine published yet" message instead of breaking.

### Backend API (Stage 2)

With `npm run dev` running in `backend/` (use any of these in the browser or in PowerShell):

```powershell
curl http://localhost:5000/api/health                  # -> 200 {"status":"ok",...}
curl http://localhost:5000/api/classes                 # -> 200 array of 9 classes
curl "http://localhost:5000/api/classes?day=Monday"    # -> 200 only Monday's classes
curl "http://localhost:5000/api/classes?day=Funday"    # -> 400 {"error":"Invalid day ..."}
curl http://localhost:5000/api/classes/1               # -> 200 one entry
curl http://localhost:5000/api/classes/999             # -> 404 {"error":"...not found"}
curl http://localhost:5000/api/exams                   # -> 200 soonest exam first
curl http://localhost:5000/api/announcements           # -> 200 newest first
curl http://localhost:5000/api/changes                 # -> 200 newest first
curl http://localhost:5000/api/does-not-exist          # -> 404 {"error":"Route not found..."}
```

## Roadmap

| Stage | Topic | Status |
|------:|-------|--------|
| 1 | Frontend + student dashboard with mock data | ✅ done |
| 2 | Express server + REST API | ✅ done |
| 3 | PostgreSQL schema, backend↔DB connection, seed script | ⬜ |
| 4 | React connects to the real API (fetch) | ⬜ |
| 5 | CR operations (add/edit/cancel/delete) + confirmation dialogs | ⬜ |
| 6 | Authentication, backend authorization, change history | ⬜ |
| 7 | Full testing + complete setup instructions | ⬜ |
