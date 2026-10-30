// src/lib/changes.js — writes the audit trail (change_history table).
// Every mutating route calls recordChange() after a successful write,
// so students can always see WHAT changed, WHEN, and BY WHOM.
import pool from '../db.js'

// '09:00' -> '9:00 AM' so history entries read naturally
function to12h(time) {
  const [hourString, minuteString] = time.split(':')
  const hour = Number(hourString)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minuteString} ${period}`
}

// One-line human summary of a class row
export function describeClass(row) {
  return `${row.day_of_week} ${to12h(row.start_time)}-${to12h(row.end_time)} - ${row.room_number} - ${row.status}`
}

// One-line human summary of an exam row
export function describeExam(row) {
  return `${row.exam_date} - ${to12h(row.start_time)}-${to12h(row.end_time)} - ${row.room_number}`
}

// Insert one change-history entry (parameterized like everything else)
export async function recordChange({
  action,
  subject,
  previousValue = null,
  newValue = null,
  userId = null,
}) {
  await pool.query(
    `INSERT INTO change_history (action, subject, previous_value, new_value, changed_by)
     VALUES ($1, $2, $3, $4, $5)`,
    [action, subject, previousValue, newValue, userId],
  )
}
