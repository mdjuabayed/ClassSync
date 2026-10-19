import { Link } from 'react-router-dom'
import useApi from '../hooks/useApi.js'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorNotice from '../components/ErrorNotice.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import {
  getDayName,
  formatFullDate,
  formatDate,
  formatTimeRange,
  parseDateOnly,
  getDaysUntil,
  formatDaysUntilLabel,
  formatRelativeTime,
} from '../utils/time.js'

// Dashboard — the default landing page (route "/").
// It gives a quick overview: today's classes, the next exams,
// the newest announcements and the latest schedule changes.
// Full details live on the other three pages.
export default function Dashboard() {
  // Four API requests — each one renders its own loading/error/empty state
  const scheduleState = useApi('/api/classes')
  const examsState = useApi('/api/exams')
  const announcementsState = useApi('/api/announcements')
  const changesState = useApi('/api/changes')

  const todayName = getDayName(new Date())

  // Today's classes, earliest first
  const todaysClasses = scheduleState.data
    .filter((entry) => entry.day_of_week === todayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  // The three upcoming exams (soonest first)
  const nextExams = [...examsState.data]
    .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
    .slice(0, 3)

  // Latest announcements (newest first)
  const latestAnnouncements = [...announcementsState.data]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)

  // Latest change-history entries (newest first)
  const recentChanges = [...changesState.data]
    .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
    .slice(0, 4)

  const statsReady =
    !scheduleState.loading &&
    !examsState.loading &&
    !announcementsState.loading

  return (
    <div>
      <header className="page-header">
        <h1>Student Dashboard</h1>
        <p className="page-subtitle">
          {formatFullDate(new Date())} · CSE-2026 batch — everything in one
          place.
        </p>
      </header>

      {statsReady && (
        <div className="stat-grid">
          <StatCard
            value={new Set(scheduleState.data.map((c) => c.course_code)).size}
            label="Courses this semester"
          />
          <StatCard value={scheduleState.data.length} label="Classes per week" />
          <StatCard value={examsState.data.length} label="Upcoming exams" />
        </div>
      )}

      <div className="dashboard-grid">
        <Section
          title={`Today's classes (${todayName})`}
          state={scheduleState}
          emptyTitle="No classes today"
          emptyMessage="Enjoy the free day — check the routine for tomorrow."
          viewAllTo="/routine"
          viewAllLabel="Full routine"
        >
          {todaysClasses.map((entry) => (
            <div key={entry.id} className="item-row">
              <div className="item-main">
                <p className="item-title">
                  {entry.course_code} · {entry.course_name}
                </p>
                <p className="item-meta">
                  {formatTimeRange(entry.start_time, entry.end_time)} ·{' '}
                  {entry.room_number} · {entry.teacher_name}
                </p>
                {entry.status_note ? (
                  <p className="item-note">{entry.status_note}</p>
                ) : null}
              </div>
              <StatusBadge status={entry.status} />
            </div>
          ))}
        </Section>

        <Section
          title="Upcoming exams"
          state={examsState}
          emptyTitle="No exams scheduled"
          emptyMessage="The CR will post the exam routine here."
          viewAllTo="/exams"
          viewAllLabel="All exams"
        >
          {nextExams.map((exam) => {
            const days = getDaysUntil(exam.exam_date)
            return (
              <div key={exam.id} className="item-row">
                <div className="item-main">
                  <p className="item-title">
                    {exam.course_code} · {exam.course_name}
                  </p>
                  <p className="item-meta">
                    {exam.exam_type} · {formatDate(parseDateOnly(exam.exam_date))}{' '}
                    · {formatTimeRange(exam.start_time, exam.end_time)} ·{' '}
                    {exam.room_number}
                  </p>
                </div>
                <span
                  className={`days-chip${days >= 0 && days <= 3 ? ' is-soon' : ''}`}
                >
                  {formatDaysUntilLabel(days)}
                </span>
              </div>
            )
          })}
        </Section>
        <Section
          title="Latest announcements"
          state={announcementsState}
          emptyTitle="No announcements yet"
          emptyMessage="New notices from your CR will appear here."
          viewAllTo="/announcements"
          viewAllLabel="All announcements"
        >
          {latestAnnouncements.map((item) => (
            <div key={item.id} className="item-row">
              <div className="item-main">
                <p className="item-title">{item.title}</p>
                <p className="item-meta">
                  {item.author_name} · {formatRelativeTime(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </Section>

        <Section
          title="Recent changes"
          state={changesState}
          emptyTitle="No changes yet"
          emptyMessage="Schedule updates will be recorded here."
        >
          {recentChanges.map((change) => (
            <div key={change.id} className="change-item">
              <p className="change-action">
                {change.action} ·{' '}
                <span className="change-subject">{change.subject}</span>
              </p>
              <p className="change-values">
                {change.previous_value !== '—' ? (
                  <span className="prev">{change.previous_value}</span>
                ) : (
                  <span>{change.previous_value}</span>
                )}{' '}
                → <span className="next">{change.new_value}</span>
              </p>
              <p className="change-meta">
                {change.changed_by} · {formatRelativeTime(change.changed_at)}
              </p>
            </div>
          ))}
        </Section>
      </div>
    </div>
  )
}

// Small card showing one number + its label
function StatCard({ value, label }) {
  return (
    <div className="stat-card">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  )
}

// Section wraps one dashboard card and handles the three states
// (loading / error / empty) so the page above stays readable.
function Section({
  title,
  state,
  emptyTitle,
  emptyMessage,
  viewAllTo,
  viewAllLabel,
  children,
}) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>{title}</h2>
        {viewAllTo ? (
          <Link className="card-link" to={viewAllTo}>
            {viewAllLabel} →
          </Link>
        ) : null}
      </div>

      {state.loading ? <LoadingState /> : null}

      {!state.loading && state.error ? (
        <ErrorNotice message={state.error} />
      ) : null}

      {!state.loading && !state.error && state.data.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : null}

      {!state.loading && !state.error && state.data.length > 0 ? (
        children
      ) : null}
    </section>
  )
}
