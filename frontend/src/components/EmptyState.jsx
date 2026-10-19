// EmptyState — friendly message when a list has nothing to show
// (no classes today, no exams yet, ...).
export default function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      {message ? <p>{message}</p> : null}
    </div>
  )
}
