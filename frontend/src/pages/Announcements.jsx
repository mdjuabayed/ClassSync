import useMockFetch from '../hooks/useMockFetch.js'
import { announcements } from '../data/mockData.js'
import { formatRelativeTime } from '../utils/time.js'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorNotice from '../components/ErrorNotice.jsx'

// Announcements page — newest first.
export default function Announcements() {
  const { data: items, loading, error } = useMockFetch(announcements)

  const sortedItems = [...items].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )

  return (
    <div>
      <header className="page-header">
        <h1>Announcements</h1>
        <p className="page-subtitle">
          Official notices from your Class Representative — newest on top.
        </p>
      </header>

      {loading ? <LoadingState label="Loading announcements…" /> : null}

      {error ? <ErrorNotice message={error} /> : null}

      {!loading && !error && sortedItems.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          message="Notices published by your CR will show up here."
        />
      ) : null}

      {!loading && !error && sortedItems.length > 0 ? (
        <div className="announcement-list">
          {sortedItems.map((item) => (
            <article key={item.id} className="announcement-card">
              <h3>{item.title}</h3>
              <p className="announcement-meta">
                {item.author_name} · {formatRelativeTime(item.created_at)}
              </p>
              <p className="announcement-body">{item.body}</p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
