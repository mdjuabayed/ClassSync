// AnnouncementForm — modal form for publishing an announcement.
import { useState } from 'react'

export default function AnnouncementForm({ submitting, error, onSubmit, onCancel }) {
  const [form, setForm] = useState({ title: '', body: '' })

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <form
        className="dialog form-dialog"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Publish announcement</h2>

        {error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : null}

        <div className="form-grid">
          <label className="form-full">
            Title
            <input
              value={form.title}
              maxLength={200}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="form-full">
            Message
            <textarea
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              required
            />
          </label>
        </div>

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
