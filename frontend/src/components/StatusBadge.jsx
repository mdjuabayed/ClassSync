// StatusBadge — the colored label shown on every class card.
// Using text (not just color) keeps it readable for colorblind users
// and gives screen readers something meaningful to announce.
const LABELS = {
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
  rescheduled: 'Rescheduled',
}

export default function StatusBadge({ status }) {
  const label = LABELS[status] ?? status
  return <span className={`badge badge--${status}`}>{label}</span>
}
