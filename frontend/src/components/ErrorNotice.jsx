// ErrorNotice — red alert box shown when a data request fails.
// role="alert" makes screen readers announce it immediately.
// Today the mock data never fails, but in Stage 4 this same
// component will appear whenever the backend is down.
export default function ErrorNotice({ message }) {
  return (
    <div className="error-notice" role="alert">
      <strong>Could not load data.</strong>
      <p>{message}</p>
      <p className="error-hint">Please try again in a moment.</p>
    </div>
  )
}
