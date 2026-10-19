import useApi from '../hooks/useApi.js'
import {
  WEEK_DAYS,
  getNextOccurrence,
  formatDate,
  formatTimeRange,
} from '../utils/time.js'
import StatusBadge from '../components/StatusBadge.jsx'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorNotice from '../components/ErrorNotice.jsx'

// Class Routine — the full weekly schedule, grouped by day.
// For each day we also show the next date it happens, so students
// always know which calendar day a routine row refers to.
export default function ClassRoutine() {
  const { data: schedule, loading, error } = useApi('/api/classes')

  return (
    <div>
      <header className="page-header">
        <h1>Class Routine</h1>
        <p className="page-subtitle">
          Weekly routine for the CSE-2026 batch · cancelled and rescheduled
          classes are clearly labelled.
        </p>
      </header>

      {loading ? <LoadingState label="Loading routine…" /> : null}

      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error && schedule.length === 0 ? (
        <EmptyState
          title="No routine published yet"
          message="Your CR will add the class routine soon."
        />
      ) : null}

      {!loading && !error && schedule.length > 0 ? (
        <div className="routine-list">
          {WEEK_DAYS.map((day) => {
            const dayClasses = schedule
              .filter((entry) => entry.day_of_week === day)
              .sort((a, b) => a.start_time.localeCompare(b.start_time))

            return (
              <section key={day} className="routine-day">
                <div className="routine-day-header">
                  <h2>{day}</h2>
                  <span className="routine-date">
                    {formatDate(getNextOccurrence(day))}
                  </span>
                </div>

                {dayClasses.length === 0 ? (
                  <p className="day-empty">No classes</p>
                ) : (
                  <div className="class-grid">
                    {dayClasses.map((entry) => (
                      <ClassCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

// One class = one card. Shows the new time first; if the class was
// rescheduled, the original time appears above it with a strikethrough.
function ClassCard({ entry }) {
  const isRescheduled = entry.status === 'rescheduled'

  return (
    <article className={`class-card status-${entry.status}`}>
      <div className="class-card-top">
        <span className="class-time">
          {isRescheduled && entry.original_start_time ? (
            <span className="old-time">
              {formatTimeRange(
                entry.original_start_time,
                entry.original_end_time,
              )}
            </span>
          ) : null}
          <span className="new-time">
            {formatTimeRange(entry.start_time, entry.end_time)}
          </span>
        </span>
        <StatusBadge status={entry.status} />
      </div>

      <h3>
        {entry.course_code} · {entry.course_name}
      </h3>
      <p className="class-meta">{entry.teacher_name}</p>
      <p className="class-meta">{entry.room_number}</p>

      {entry.status_note ? (
        <p className="class-note">{entry.status_note}</p>
      ) : null}
    </article>
  )
}