# ClassSync

A small full-stack web app for **one university class**: the weekly class routine, exam schedule and academic announcements in one place — instead of scrolling through Facebook groups and WhatsApp messages.

**Current status: Stage 1 of 7 complete** — the student frontend is built with temporary mock data. The backend, database, CR dashboard and login are added in the following stages (see Roadmap).

## Tech stack

- **Frontend:** React (JavaScript) + Vite
- **Backend:** Node.js + Express _(Stage 2)_
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
├── backend/                   # Express API (created in Stage 2)
├── .gitignore
└── README.md
```

## How to run Stage 1

Requirements: **Node.js 18+** and npm.

```bash
cd frontend
npm install        # first time only — downloads dependencies
npm run dev        # starts the dev server
```

Then open **http://localhost:5173** in your browser.

Other useful commands (run inside `frontend/`):

```bash
npm run build      # production build into frontend/dist
npm run preview    # preview the production build
```

## Testing checklist (Stage 1)

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

## Roadmap

| Stage | Topic | Status |
|------:|-------|--------|
| 1 | Frontend + student dashboard with mock data | ✅ done |
| 2 | Express server + REST API | ⬜ |
| 3 | PostgreSQL schema, backend↔DB connection, seed script | ⬜ |
| 4 | React connects to the real API (fetch) | ⬜ |
| 5 | CR operations (add/edit/cancel/delete) + confirmation dialogs | ⬜ |
| 6 | Authentication, backend authorization, change history | ⬜ |
| 7 | Full testing + complete setup instructions | ⬜ |
