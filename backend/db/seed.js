// db/seed.js — the seed script: applies db/schema.sql, then inserts the
// fictional demo data (users with bcrypt password hashes, classes, exams,
// announcements and a few change-history entries).
//
// Run:  npm run db:seed     (safe to re-run — it resets the tables first)
import { readFileSync } from 'node:fs'
import bcrypt from 'bcryptjs'
import pool from '../src/db.js'

// --- 1) apply the schema --------------------------------------------------
const schemaSql = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')
await pool.query(schemaSql)
console.log('Schema applied (tables dropped + recreated).')

// --- 2) demo accounts -----------------------------------------------------
// Demo credentials for LOCAL TESTING ONLY — published in the README.
// Replace them before any real deployment.
const crPassword = process.env.SEED_CR_PASSWORD || 'cr1234'
const studentPassword = process.env.SEED_STUDENT_PASSWORD || 'student123'

const crHash = await bcrypt.hash(crPassword, 10)
const { rows: crRows } = await pool.query(
  `INSERT INTO users (name, email, password_hash, role)
   VALUES ($1, $2, $3, 'cr') RETURNING id`,
  ['xyz', 'cr@classsync.test', crHash],
)
const crId = crRows[0].id

const studentHash = await bcrypt.hash(studentPassword, 10)
const { rows: studentRows } = await pool.query(
  `INSERT INTO users (name, email, password_hash, role)
   VALUES ($1, $2, $3, 'student') RETURNING id`,
  ['Rafiul Islam', 'student@classsync.test', studentHash],
)
const studentId = studentRows[0].id

console.log(`Users created: CR (id ${crId}), student (id ${studentId}).`)

// --- 3) demo classes ------------------------------------------------------
const classes = [
  // Sunday
  { course_code: 'MATH-2151', course_name: 'Math 2151 — Differential Equations', teacher_name: 'Prof. Dr. Md. Rafiqul Islam / Prof. Dr. Sarder Firoz Ahmmed', day_of_week: 'Sunday', start_time: '09:00', end_time: '10:40', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2101', course_name: 'CSE 2101 — Data Structures', teacher_name: 'Prof. Dr. Abu Shamim Mohammad Arif', day_of_week: 'Sunday', start_time: '10:40', end_time: '11:30', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2103', course_name: 'CSE 2103 — Numerical Methods for Engineers', teacher_name: 'Farhana Tazmim Pinki', day_of_week: 'Sunday', start_time: '11:30', end_time: '12:20', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2105', course_name: 'CSE 2105 — Digital Logic Design', teacher_name: 'Md. Farhan Sadique', day_of_week: 'Sunday', start_time: '13:40', end_time: '15:20', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  // Monday
  { course_code: 'CSE-2101', course_name: 'CSE 2101 — Data Structures', teacher_name: 'Prof. Dr. Abu Shamim Mohammad Arif', day_of_week: 'Monday', start_time: '09:00', end_time: '09:50', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'ECE-2151', course_name: 'ECE 2151 — Electronic Devices and Circuits', teacher_name: 'Prof. Dr. Md. Mahbub Hossain / Prof. Dr. Md. Ziaul Amin', day_of_week: 'Monday', start_time: '09:50', end_time: '10:40', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2103', course_name: 'CSE 2103 — Numerical Methods for Engineers', teacher_name: 'Farhana Tazmim Pinki', day_of_week: 'Monday', start_time: '10:40', end_time: '11:30', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'ECE-2152', course_name: 'ECE 2152 (Lab) — Electronic Devices and Circuits Laboratory', teacher_name: 'Prof. Dr. Md. Mahbub Hossain & Prof. Dr. Md. Ziaul Amin', day_of_week: 'Monday', start_time: '11:30', end_time: '13:10', room_number: 'ECE Discipline', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  // Tuesday
  { course_code: 'CSE-2101', course_name: 'CSE 2101 — Data Structures', teacher_name: 'Prof. Dr. Abu Shamim Mohammad Arif', day_of_week: 'Tuesday', start_time: '09:00', end_time: '09:50', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'ECE-2151', course_name: 'ECE 2151 — Electronic Devices and Circuits', teacher_name: 'Prof. Dr. Md. Mahbub Hossain / Prof. Dr. Md. Ziaul Amin', day_of_week: 'Tuesday', start_time: '09:50', end_time: '10:40', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2103', course_name: 'CSE 2103 — Numerical Methods for Engineers', teacher_name: 'Farhana Tazmim Pinki', day_of_week: 'Tuesday', start_time: '10:40', end_time: '11:30', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2104', course_name: 'CSE 2104 (Lab) — Numerical Methods for Engineers Laboratory', teacher_name: 'Farhana Tazmim Pinki & Prof. Dr. S.M. Rafizul Haque', day_of_week: 'Tuesday', start_time: '11:30', end_time: '13:10', room_number: 'Lab 1', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  // Wednesday
  { course_code: 'CSE-2102', course_name: 'CSE 2102 (Lab) — Data Structures Laboratory', teacher_name: 'Prof. Dr. Abu Shamim Mohammad Arif & Aminul Islam', day_of_week: 'Wednesday', start_time: '09:00', end_time: '11:30', room_number: 'Lab 1', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2105', course_name: 'CSE 2105 — Digital Logic Design', teacher_name: 'Md. Farhan Sadique', day_of_week: 'Wednesday', start_time: '11:30', end_time: '12:20', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'ECE-2151', course_name: 'ECE 2151 — Electronic Devices and Circuits', teacher_name: 'Prof. Dr. Md. Mahbub Hossain / Prof. Dr. Md. Ziaul Amin', day_of_week: 'Wednesday', start_time: '12:20', end_time: '13:10', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  // Thursday
  { course_code: 'MATH-2151', course_name: 'Math 2151 — Differential Equations', teacher_name: 'Prof. Dr. Md. Rafiqul Islam / Prof. Dr. Sarder Firoz Ahmmed', day_of_week: 'Thursday', start_time: '09:00', end_time: '09:50', room_number: 'Room 1204', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2106', course_name: 'CSE 2106 (Lab) — Digital Logic Design Laboratory', teacher_name: 'Md. Farhan Sadique & Prof. Dr. Kamrul Hasan Talukder', day_of_week: 'Thursday', start_time: '09:50', end_time: '12:20', room_number: 'DLD Lab', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
  { course_code: 'CSE-2100', course_name: 'CSE 2100 (Lab) — Advanced Programming Laboratory', teacher_name: 'Sajib Chatterjee & Abdullah Al Noman', day_of_week: 'Thursday', start_time: '13:40', end_time: '16:00', room_number: 'Lab 2', status: 'scheduled', status_note: null, original_start_time: null, original_end_time: null },
]

// One parameterized INSERT per row ($1…$11 are placeholders for values —
// the values array is sent separately, which is what blocks SQL injection).
for (const c of classes) {
  await pool.query(
    `INSERT INTO classes (course_code, course_name, teacher_name, day_of_week,
                          start_time, end_time, room_number, status, status_note,
                          original_start_time, original_end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [c.course_code, c.course_name, c.teacher_name, c.day_of_week,
     c.start_time, c.end_time, c.room_number, c.status, c.status_note,
     c.original_start_time, c.original_end_time],
  )
}
console.log(`Inserted ${classes.length} class slots.`)

// --- 3b) demo one-day overrides -------------------------------------------
// One-off changes for a single date that must NOT touch the weekly routine.
// No overrides in the current routine — array kept empty.
const overrides = []
for (const o of overrides) {
  await pool.query(
    `INSERT INTO class_overrides (class_id, override_date, start_time, end_time, room_number, status, status_note)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [o.class_id, o.override_date, o.start_time, o.end_time, o.room_number, o.status, o.status_note],
  )
}
console.log(`Inserted ${overrides.length} one-day override(s).`)

// --- 4) demo exams --------------------------------------------------------
const exams = [
  { course_code: 'CSE-2101', course_name: 'CSE 2101', exam_type: 'Midterm', exam_date: '2026-11-05', start_time: '10:00', end_time: '12:00', room_number: 'Exam Hall 2' },
  { course_code: 'MATH-2151', course_name: 'Math 2151', exam_type: 'Midterm', exam_date: '2026-11-07', start_time: '10:00', end_time: '12:00', room_number: 'Exam Hall 2' },
  { course_code: 'CSE-2103', course_name: 'CSE 2103', exam_type: 'Midterm', exam_date: '2026-11-12', start_time: '10:00', end_time: '12:00', room_number: 'Exam Hall 1' },
]

for (const e of exams) {
  await pool.query(
    `INSERT INTO exams (course_code, course_name, exam_type, exam_date,
                        start_time, end_time, room_number)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [e.course_code, e.course_name, e.exam_type, e.exam_date,
     e.start_time, e.end_time, e.room_number],
  )
}
console.log(`Inserted ${exams.length} exams.`)

// --- 5) demo announcements ------------------------------------------------
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000)

const announcements = [
  { title: "Monday's ECE 2151 class is cancelled", body: "ECE 2151 will not be held on Monday. The syllabus will be covered in Wednesday's class instead.", hours: 3 },
  { title: 'Midterm exam routine published', body: 'The midterm routine for all courses is now available on the Exams page. Please check your seat plan one day before each exam.', hours: 26 },
  { title: 'Tuesday class moved to Lab 1', body: 'CSE 2104 Lab on Tuesday will be held at Lab 1 instead of the usual room.', hours: 50 },
  { title: 'Welcome to a new semester', body: 'Routine, exam updates and official notices will all be posted here from now on — no more searching through Facebook groups.', hours: 120 },
]

for (const a of announcements) {
  await pool.query(
    `INSERT INTO announcements (title, body, author_id, created_at)
     VALUES ($1, $2, $3, $4)`,
    [a.title, a.body, crId, hoursAgo(a.hours)],
  )
}
console.log(`Inserted ${announcements.length} announcements.`)

// --- 6) demo change history ----------------------------------------------
const changes = [
  { action: 'Cancelled class', subject: 'CSE-202 Database Systems (Monday)', previous_value: 'Scheduled · Mon 10:00 AM – 11:30 AM · Room 402', new_value: 'Cancelled · Teacher on leave', hours: 3 },
  { action: 'Published announcement', subject: 'Midterm exam routine published', previous_value: '—', new_value: 'Announcement visible to all students', hours: 26 },
  { action: 'Rescheduled class', subject: 'CSE-203 Computer Networks (Tuesday)', previous_value: 'Tue 9:00 AM – 10:30 AM · Room 401', new_value: 'Tue 3:00 PM – 4:30 PM · Room 405', hours: 50 },
  { action: 'Added exam', subject: 'CSE-202 Quiz 1', previous_value: '—', new_value: '29 Oct 2026 · 11:00 AM · Room 402', hours: 74 },
]

for (const c of changes) {
  await pool.query(
    `INSERT INTO change_history (action, subject, previous_value, new_value,
                                 changed_by, changed_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [c.action, c.subject, c.previous_value, c.new_value, crId, hoursAgo(c.hours)],
  )
}
console.log(`Inserted ${changes.length} change-history entries.`)

// --- done -----------------------------------------------------------------
console.log('')
console.log('Seed complete. Demo logins (local testing only):')
console.log(`  CR      : cr@classsync.test / ${crPassword}`)
console.log(`  Student : student@classsync.test / ${studentPassword}`)

await pool.end() // close connections so the script can exit cleanly

