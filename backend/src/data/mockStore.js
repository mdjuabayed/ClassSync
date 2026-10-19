// ---------------------------------------------------------------------------
// ⚠ TEMPORARY in-memory data (Stage 2 only).
//
// These plain arrays stand in for the PostgreSQL tables that arrive in
// Stage 3. When the database is connected, this file is deleted and each
// route handler's `classes` / `exams` / ... is replaced with a
// parameterized query such as:
//
//     const { rows } = await pool.query('SELECT * FROM classes ORDER BY ...')
//
// Field names already match the SQL columns, so the routes and the
// React pages will not need to change.
// ---------------------------------------------------------------------------

// ISO timestamp N hours before now, so the demo data stays "fresh"
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

// Used for validating the ?day= query parameter
export const WEEK_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

// Weekly routine (recurring every week)
export const classes = [
  {
    id: 1,
    course_code: 'CSE-201',
    course_name: 'Data Structures',
    teacher_name: 'Dr. Farhana Rahman',
    day_of_week: 'Sunday',
    start_time: '09:00',
    end_time: '10:30',
    room_number: 'Room 401',
    status: 'scheduled',
    status_note: null,
    original_start_time: null,
    original_end_time: null,
  },
  {
    id: 2,
    course_code: 'MAT-201',
    course_name: 'Discrete Mathematics',
    teacher_name: 'Md. Kamrul Hasan',
    day_of_week: 'Sunday',
    start_time: '11:00',
    end_time: '12:30',
    room_number: 'Room 305',
    status: 'scheduled',
    status_note: null,
    original_start_time: null,
    original_end_time: null,
  },
  {
    id: 3,
    course_code: 'CSE-202',
    course_name: 'Database Systems',
    teacher_name: 'Tanvir Ahmed',
    day_of_week: 'Monday',
    start_time: '10:00',
    end_time: '11:30',
    room_number: 'Room 402',
    status: 'cancelled',
    status_note: 'Teacher on leave (official duty). Will be adjusted next week.',
    original_start_time: null,
    original_end_time: null,
  },
  {
    id: 4,
    course_code: 'CSE-204',
    course_name: 'Software Engineering',
    teacher_name: 'Ayesha Siddiqua',
    day_of_week: 'Monday',
    start_time: '14:00',
    end_time: '15:30',
    room_number: 'Room 302',
    status: 'scheduled',
    status_note: null,
    original_start_time: null,
    original_end_time: null,
  },
  {
    id: 5,
    course_code: 'CSE-203',
    course_name: 'Computer Networks',
    teacher_name: 'Sabbir Hossain',
    day_of_week: 'Tuesday',
    start_time: '15:00',
    end_time: '16:30',
    room_number: 'Room 405',
    status: 'rescheduled',
    status_note: 'Room 401 unavailable — class moved to the afternoon.',
    original_start_time: '09:00',
    original_end_time: '10:30',
  },
  {
    id: 6,
    course_code: 'CSE-201',
    course_name: 'Data Structures',
    teacher_name: 'Dr. Farhana Rahman',
    day_of_week: 'Wednesday',
    start_time: '09:00',
    end_time: '10:30',
    room_number: 'Room 401',
    status: 'scheduled',
    status_note: null,
    original_start_time: null,
    original_end_time: null,
  },
  {
    id: 7,
    course_code: 'CSE-202',
    course_name: 'Database Systems',
    teacher_name: 'Tanvir Ahmed',
    day_of_week: 'Wednesday',
    start_time: '11:00',
    end_time: '12:30',
    room_number: 'Room 402',
    status: 'scheduled',
    status_note: null,
    original_start_time: null,
    original_end_time: null,
  },
  {
    id: 8,
    course_code: 'MAT-201',
    course_name: 'Discrete Mathematics',
    teacher_name: 'Md. Kamrul Hasan',
    day_of_week: 'Thursday',
    start_time: '10:00',
    end_time: '11:30',
    room_number: 'Room 305',
    status: 'scheduled',
    status_note: null,
    original_start_time: null,
    original_end_time: null,
  },
  {
    id: 9,
    course_code: 'CSE-203',
    course_name: 'Computer Networks',
    teacher_name: 'Sabbir Hossain',
    day_of_week: 'Thursday',
    start_time: '14:00',
    end_time: '15:30',
    room_number: 'Room 401',
    status: 'scheduled',
    status_note: null,
    original_start_time: null,
    original_end_time: null,
  },
]

// Upcoming exams (exam_date = YYYY-MM-DD, like a PG DATE column)
export const exams = [
  {
    id: 1,
    course_code: 'CSE-202',
    course_name: 'Database Systems',
    exam_type: 'Quiz 1',
    exam_date: '2026-10-29',
    start_time: '11:00',
    end_time: '12:00',
    room_number: 'Room 402',
  },
  {
    id: 2,
    course_code: 'CSE-201',
    course_name: 'Data Structures',
    exam_type: 'Midterm',
    exam_date: '2026-11-05',
    start_time: '10:00',
    end_time: '12:00',
    room_number: 'Exam Hall 2',
  },
  {
    id: 3,
    course_code: 'MAT-201',
    course_name: 'Discrete Mathematics',
    exam_type: 'Midterm',
    exam_date: '2026-11-07',
    start_time: '10:00',
    end_time: '12:00',
    room_number: 'Exam Hall 2',
  },
  {
    id: 4,
    course_code: 'CSE-203',
    course_name: 'Computer Networks',
    exam_type: 'Midterm',
    exam_date: '2026-11-12',
    start_time: '10:00',
    end_time: '12:00',
    room_number: 'Exam Hall 1',
  },
]

// Announcements (created_at = ISO timestamp, like a PG TIMESTAMP column)
export const announcements = [
  {
    id: 1,
    title: "Monday's Database Systems class is cancelled",
    body: "Tanvir Sir has official duty on Monday, so CSE-202 will not be held. The syllabus will be covered in Wednesday's class instead.",
    author_name: 'Nusrat Jahan (CR)',
    created_at: hoursAgo(3),
  },
  {
    id: 2,
    title: 'Midterm exam routine published',
    body: 'The midterm routine for all courses is now available on the Exams page. Please check your seat plan one day before each exam.',
    author_name: 'Nusrat Jahan (CR)',
    created_at: hoursAgo(26),
  },
  {
    id: 3,
    title: 'Tuesday class moved to Room 405',
    body: 'Computer Networks on Tuesday will be held at 3:00 PM in Room 405 instead of the morning slot, because Room 401 is under maintenance.',
    author_name: 'Nusrat Jahan (CR)',
    created_at: hoursAgo(50),
  },
  {
    id: 4,
    title: 'Welcome to a new semester',
    body: 'Routine, exam updates and official notices will all be posted here from now on — no more searching through Facebook groups.',
    author_name: 'Nusrat Jahan (CR)',
    created_at: hoursAgo(120),
  },
]

// Change history — action + timestamp + previous/new values.
// Stage 6 will append to this automatically whenever the CR edits data.
export const changeHistory = [
  {
    id: 1,
    action: 'Cancelled class',
    subject: 'CSE-202 Database Systems (Monday)',
    previous_value: 'Scheduled · Mon 10:00 AM – 11:30 AM · Room 402',
    new_value: 'Cancelled · Teacher on leave',
    changed_by: 'Nusrat Jahan (CR)',
    changed_at: hoursAgo(3),
  },
  {
    id: 2,
    action: 'Published announcement',
    subject: 'Midterm exam routine published',
    previous_value: '—',
    new_value: 'Announcement visible to all students',
    changed_by: 'Nusrat Jahan (CR)',
    changed_at: hoursAgo(26),
  },
  {
    id: 3,
    action: 'Rescheduled class',
    subject: 'CSE-203 Computer Networks (Tuesday)',
    previous_value: 'Tue 9:00 AM – 10:30 AM · Room 401',
    new_value: 'Tue 3:00 PM – 4:30 PM · Room 405',
    changed_by: 'Nusrat Jahan (CR)',
    changed_at: hoursAgo(50),
  },
  {
    id: 4,
    action: 'Added exam',
    subject: 'CSE-202 Quiz 1',
    previous_value: '—',
    new_value: '29 Oct 2026 · 11:00 AM · Room 402',
    changed_by: 'Nusrat Jahan (CR)',
    changed_at: hoursAgo(74),
  },
]
