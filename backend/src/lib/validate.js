// src/lib/validate.js — shared input validation for the write routes.
// Every route builds a list of error messages; if it is not empty the
// request is rejected with 400 BEFORE anything touches the database.

// Must match the CHECK constraints in db/schema.sql
export const WEEK_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
export const CLASS_STATUSES = ['scheduled', 'cancelled', 'rescheduled']

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

// 24-hour "HH:MM" — exactly what <input type="time"> produces
export function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

// "YYYY-MM-DD" — exactly what <input type="date"> produces
export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
}

// Empty strings become NULL (the database stores NULL, not '')
export function emptyToNull(value) {
  if (value === null || value === undefined) return null
  const trimmed = String(value).trim()
  return trimmed === '' ? null : trimmed
}

// Validation for creating/updating a class routine entry.
// Returns an array of human-readable problems (empty array = valid).
export function validateClassBody(body) {
  const errors = []

  if (!isNonEmptyString(body.course_code)) errors.push('course_code is required')
  if (!isNonEmptyString(body.course_name)) errors.push('course_name is required')
  if (!isNonEmptyString(body.teacher_name)) errors.push('teacher_name is required')
  if (!isNonEmptyString(body.room_number)) errors.push('room_number is required')

  if (!WEEK_DAYS.includes(body.day_of_week)) {
    errors.push(`day_of_week must be one of: ${WEEK_DAYS.join(', ')}`)
  }

  if (!isValidTime(body.start_time)) errors.push('start_time must be HH:MM (24-hour)')
  if (!isValidTime(body.end_time)) errors.push('end_time must be HH:MM (24-hour)')
  if (
    isValidTime(body.start_time) &&
    isValidTime(body.end_time) &&
    body.end_time <= body.start_time
  ) {
    errors.push('end_time must be after start_time')
  }

  if (body.status !== undefined && body.status !== null && body.status !== '') {
    if (!CLASS_STATUSES.includes(body.status)) {
      errors.push('status must be scheduled, cancelled or rescheduled')
    }
  }

  if (body.original_start_time && !isValidTime(body.original_start_time)) {
    errors.push('original_start_time must be HH:MM')
  }
  if (body.original_end_time && !isValidTime(body.original_end_time)) {
    errors.push('original_end_time must be HH:MM')
  }

  return errors
}

// Validation for creating/updating an exam.
export function validateExamBody(body) {
  const errors = []

  if (!isNonEmptyString(body.course_code)) errors.push('course_code is required')
  if (!isNonEmptyString(body.course_name)) errors.push('course_name is required')
  if (!isNonEmptyString(body.exam_type)) errors.push('exam_type is required')
  if (!isNonEmptyString(body.room_number)) errors.push('room_number is required')

  if (!isValidDate(body.exam_date)) errors.push('exam_date must be YYYY-MM-DD')
  if (!isValidTime(body.start_time)) errors.push('start_time must be HH:MM (24-hour)')
  if (!isValidTime(body.end_time)) errors.push('end_time must be HH:MM (24-hour)')
  if (
    isValidTime(body.start_time) &&
    isValidTime(body.end_time) &&
    body.end_time <= body.start_time
  ) {
    errors.push('end_time must be after start_time')
  }

  return errors
}
