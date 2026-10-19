import useApi from '../hooks/useApi.js'
import {
  parseDateOnly,
  formatFullDate,
  formatTimeRange,
  getDaysUntil,
  formatDaysUntilLabel,
} from '../utils/time.js'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorNotice from '../components/ErrorNotice.jsx'

// Exams page — every upcoming exam, soonest first.
export default function Exams() {
  const { data: exams, loading, error } = useApi('/api/exams')

  const sortedExams = [...exams].sort((a, b) =>
    a.exam_date.localeCompare(b.exam_date),
  )

  return (
    <div>
      <header className="page-header">
        <h1>Exams</h1>
        <p className="page-subtitle">
          Upcoming exams and quizzes — check back for seat plans and updates.
        </p>
      </header>

      {loading ? <LoadingState label="Loading exams…" /> : null}

      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error && sortedExams.length === 0 ? (
        <EmptyState
          title="No exams scheduled"
          message="The exam routine will appear here once your CR publishes it."
        />
      ) : null}

      {!loading && !error && sortedExams.length > 0 ? (
        <div className="exam-list">
          {sortedExams.map((exam) => {
            const examDate = parseDateOnly(exam.exam_date)
            const days = getDaysUntil(exam.exam_date)

            return (
              <article key={exam.id} className="exam-card">
                <div className="exam-date">
                  <span className="day">{examDate.getDate()}</span>
                  <span className="month">
                    {examDate.toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                </div>

                <div className="exam-info">
                  <h3>
                    {exam.course_code} · {exam.course_name}
                  </h3>
                  <p className="exam-meta">
                    {exam.exam_type} · {formatFullDate(examDate)}
                  </p>
                  <p className="exam-meta">
                    {formatTimeRange(exam.start_time, exam.end_time)} ·{' '}
                    {exam.room_number}
                  </p>
                </div>

                <span
                  className={`days-chip${days >= 0 && days <= 3 ? ' is-soon' : ''}`}
                >
                  {formatDaysUntilLabel(days)}
                </span>
              </article>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
