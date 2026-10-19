// ---------------------------------------------------------------------------
// Small date/time helpers used by every page.
//
// Conventions used across the app (and later by PostgreSQL):
//   - times   are 24-hour strings  -> "09:30"  (like a PG TIME column)
//   - dates   are YYYY-MM-DD       -> "2026-11-05" (like a PG DATE column)
//   - stamps  are ISO strings      -> "2026-10-19T10:30:00.000Z" (PG TIMESTAMP)
// All display formatting lives here so pages stay simple.
// ---------------------------------------------------------------------------

// WEEK_DAYS — full English weekday names, Sunday first
// (Sunday–Thursday is the class week in the seed data).
export const WEEK_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

// "09:05" -> "9:05 AM"
export function formatTime(time24) {
  if (!time24) return ''
  const [hourString, minuteString] = time24.split(':')
  const hour = Number(hourString)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minuteString} ${period}`
}

// "09:00", "10:30" -> "9:00 AM – 10:30 AM"
export function formatTimeRange(start24, end24) {
  return `${formatTime(start24)} – ${formatTime(end24)}`
}

// The full English name of a weekday for a Date, e.g. "Monday"
export function getDayName(date) {
  return WEEK_DAYS[date.getDay()]
}

// The next date (today included) matching a weekday name.
// Used to show "when does this routine day happen next".
export function getNextOccurrence(dayName) {
  const targetIndex = WEEK_DAYS.indexOf(dayName)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysAway = (targetIndex - today.getDay() + 7) % 7
  const result = new Date(today)
  result.setDate(today.getDate() + daysAway)
  return result
}

// Date -> "Mon, 19 Oct"
export function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// "2026-11-05" -> Date object set to LOCAL midnight.
// Careful: new Date("2026-11-05") alone is parsed as UTC midnight, which can
// shift the day by one when your timezone is ahead of UTC (like +06:00).
// Appending "T00:00:00" forces local time so the correct day is displayed.
export function parseDateOnly(dateString) {
  return new Date(`${dateString}T00:00:00`)
}

// Full date for headings: "Thursday, 5 November 2026"
export function formatFullDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Whole days from today until a YYYY-MM-DD date (0 = today, 1 = tomorrow).
export function getDaysUntil(dateString) {
  const target = parseDateOnly(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

// Human label for exam cards
export function formatDaysUntilLabel(days) {
  if (days < 0) return 'Completed'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

// ISO timestamp -> "3 hours ago" / "2 days ago" / "12 Oct 2026"
export function formatRelativeTime(isoString) {
  const then = new Date(isoString).getTime()
  const seconds = Math.round((Date.now() - then) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`

  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
