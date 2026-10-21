// ClassOverrideForm — modal form for a ONE-DAY change to a class.
//
// It edits class_overrides (start/end/room/status/note for one date only) and
// NEVER touches the weekly routine in classes. Pass currentOverride = null when
// there is no override yet; the form then pre-fills from the routine row so the
// CR only has to change what differs for that day.
import { useState } from 'react'

const STATUSES = ['scheduled', 'cancelled', 'rescheduled']

function initialValues(item, override) {
  return {
    start_time: override?.start_time ?? item.start_time,
    end_time: override?.end_time ?? item.end_time,
    room_number: override?.room_number ?? item.room_number,
    status: override?.status ?? item.status,
    status_note: override?.status_note ?? '',
  }
}

export default function ClassOverrideForm({
  item,
  date,
  currentOverride,
  submitting,
  error,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(() => initialValues(item, currentOverride))

  function set(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  const isRevert = !!currentOverride

  return (
    <div className="dialog-backdrop" role="presentation">
      <form className="dialog form-dialog" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <h2>
          {isRevert ? 'Change this one-day override' : `One-day change for ${item.course_code}`}
        </h2>
        <p className="item-meta" style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#666' }}>
          Applies to <strong>{date}</strong> only — the weekly routine stays unchanged.
        </p>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        <div className="form-grid">
          <label>
            Starts at
            <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} required />
          </label>
          <label>
            Ends at
            <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} required />
          </label>
          <label>
            Room
            <input value={form.room_number} onChange={(e) => set('room_number', e.target.value)} required />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="form-full">
            Note (shown to students)
            <input
              value={form.status_note}
              placeholder="e.g. Room 405 instead of Room 402 today"
              onChange={(e) => set('status_note', e.target.value)}
            />
          </label>
        </div>

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : isRevert ? 'Update override' : `Save change for ${date}`}
          </button>
        </div>
      </form>
    </div>
  )
}