-- ===========================================================================
-- ClassSync — PostgreSQL schema (Stage 3)
--
-- How to apply:
--   npm run db:seed      (seed.js runs THIS file, then inserts demo data)
-- or manually:
--   psql "<DATABASE_URL>" -f db/schema.sql
--
-- Design notes:
--   * SERIAL PRIMARY KEY  -> auto-incrementing integer id (like an ID counter)
--   * REFERENCES ...      -> foreign key: values must exist in the other table
--   * TIMESTAMPTZ         -> timestamp WITH time zone (safe across timezones)
--   * CHECK               -> rejects invalid values at the database level,
--                            so bad data cannot enter even if the API has a bug
-- ===========================================================================

-- Clean slate so the script is safe to re-run (fine for a prototype;
-- a production migration would never DROP tables like this).
DROP TABLE IF EXISTS change_history CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS class_overrides CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------------------------------------------------------------------------
-- users: students AND the Class Representative (CR) in one table.
-- The "role" column decides what an account may do — enforced in the API.
-- password_hash stores a bcrypt hash (never a plain password).
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role          VARCHAR(10)  NOT NULL CHECK (role IN ('student', 'cr')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- classes: the weekly recurring routine (one row = one weekly slot).
-- status drives the UI labels: scheduled / cancelled / rescheduled.
-- original_*_time remembers the old slot when a class was rescheduled.
-- ---------------------------------------------------------------------------
CREATE TABLE classes (
  id                  SERIAL PRIMARY KEY,
  course_code         VARCHAR(20)  NOT NULL,
  course_name         VARCHAR(100) NOT NULL,
  teacher_name        VARCHAR(100) NOT NULL,
  day_of_week         VARCHAR(10)  NOT NULL CHECK (day_of_week IN (
                        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
                        'Thursday', 'Friday', 'Saturday')),
  start_time          TIME         NOT NULL,
  end_time            TIME         NOT NULL,
  room_number         VARCHAR(50)  NOT NULL,
  status              VARCHAR(12)  NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled', 'cancelled', 'rescheduled')),
  status_note         TEXT,
  original_start_time TIME,
  original_end_time   TIME,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT classes_time_order      CHECK (end_time > start_time),
  CONSTRAINT classes_original_order  CHECK (
    original_end_time IS NULL OR original_end_time > original_start_time)
);

-- ---------------------------------------------------------------------------
-- exams: one row per exam/quiz.
-- ---------------------------------------------------------------------------
CREATE TABLE exams (
  id           SERIAL PRIMARY KEY,
  course_code  VARCHAR(20)  NOT NULL,
  course_name  VARCHAR(100) NOT NULL,
  exam_type    VARCHAR(50)  NOT NULL,
  exam_date    DATE         NOT NULL,
  start_time   TIME         NOT NULL,
  end_time     TIME         NOT NULL,
  room_number  VARCHAR(50)  NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT exams_time_order CHECK (end_time > start_time)
);

-- ---------------------------------------------------------------------------
-- announcements: author_id links to the CR who published it.
-- ON DELETE SET NULL keeps the announcement if the account is ever removed.
-- ---------------------------------------------------------------------------
CREATE TABLE announcements (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  body       TEXT         NOT NULL,
  author_id  INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- change_history: the audit trail (action, timestamp, previous & new values).
-- Written automatically by the API whenever a CR changes something (Stage 6).
-- ---------------------------------------------------------------------------
CREATE TABLE change_history (
  id             SERIAL PRIMARY KEY,
  action         VARCHAR(50)  NOT NULL,
  subject        VARCHAR(200) NOT NULL,
  previous_value TEXT,
  new_value      TEXT,
  changed_by     INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  changed_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes speed up the two most frequent lookups
CREATE INDEX idx_classes_day  ON classes (day_of_week);
CREATE INDEX idx_exams_date   ON exams (exam_date);
CREATE INDEX idx_changes_time ON change_history (changed_at DESC);

-- ---------------------------------------------------------------------------
-- class_overrides: one-off changes for a SINGLE date (e.g. "this Monday only").
--
-- The classes table is the FINAL weekly routine template and is never touched
-- by one-day changes. Overrides layer on top at query time (see
-- GET /api/classes/on). An override row may leave fields NULL — a NULL field
-- falls back to the routine value for that date.
-- ---------------------------------------------------------------------------
CREATE TABLE class_overrides (
  id            SERIAL PRIMARY KEY,
  class_id      INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  override_date DATE    NOT NULL,
  start_time    TIME,
  end_time      TIME,
  room_number   VARCHAR(100),
  status        VARCHAR(50),
  status_note   TEXT,
  UNIQUE(class_id, override_date)
);

CREATE INDEX idx_overrides_class_date ON class_overrides (class_id, override_date);
CREATE INDEX idx_overrides_date       ON class_overrides (override_date);
