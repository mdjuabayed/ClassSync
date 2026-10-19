// LoginForm — shown on the CR Dashboard when nobody is signed in.
// Students never see this: viewing the app needs no account at all.
import { useState } from 'react'
import { apiPost } from '../api.js'

export default function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const result = await apiPost('/api/auth/login', form)
      onSuccess(result.user)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-card card">
      <h2>CR sign in</h2>
      <p className="login-intro">
        Students don't need an account — this area is only for the Class
        Representative.
      </p>

      {error ? (
        <p className="form-error" role="alert">{error}</p>
      ) : null}

      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="login-hint">
        Demo CR login for local testing: <strong>cr@classsync.test</strong> /{' '}
        <strong>cr1234</strong>
      </p>
    </div>
  )
}
