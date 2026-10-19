// LoadingState — spinner shown while data is on its way.
// role="status" lets screen readers announce the wait.
export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="loading-state" role="status">
      <div className="spinner" aria-hidden="true"></div>
      <p>{label}</p>
    </div>
  )
}
