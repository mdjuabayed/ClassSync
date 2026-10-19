// ClassForm — modal form used for BOTH adding and editing a class entry
// (pass item = null for "add", item = the row for "edit").
// The actual API call happens in the parent page; this file only handles
// the form state and calls onSubmit(values).
import { useState } from 'react'

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
]
const STATUSES = ['scheduled', 'cancelled', 'rescheduled']

function initialValues(item) {
  if (item) {
    return {
      ...item,
      status_note: item.status_note ?? '',
      original_start_time: item.original_start_time ?? '',
      original_end_time: item.original_end_time ?? '',
    }
  }
  return {
    course_code: '',
    course_name: '',
    teacher_name: '',
    day_of_week: 'Sunday',
    start_time: '09:00',
    end_time: '10:30',
    room_number: '',
    status: 'scheduled',
    status_note: '',
    original_start_time: '',
    original_end_time: '',
  }
}

export default function ClassForm({ item, submitting, error, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => initialValues(item))

  function set(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  const showOriginal = form.status === 'rescheduled'

  return (
    <div className="dialog-backdrop" role="presentation">
      <form
        className="dialog form-dialog"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{item ? `Edit class #${item.id}` : 'Add class to routine'}</h2>

        {error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : null}

        <div className="form-grid">
          <label>
            Course code
            <input value={form.course_code} onChange={(e) => set('course_code', e.target.value)} required />
          </label>
          <label>
            Course name
            <input value={form.course_name} onChange={(e) => set('course_name', e.target.value)} required />
          </label>
          <label>
            Teacher
            <input value={form.teacher_name} onChange={(e) => set('teacher_name', e.target.value)} required />
          </label>
          <label>
            Room
            <input value={form.room_number} onChange={(e) => set('room_number', e.target.value)} required />
          </label>
          <label>
            Day
            <select value={form.day_of_week} onChange={(e) => set('day_of_week', e.target.value)}>
              {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Starts at
            <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} required />
          </label>
          <label>
            Ends at
            <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} required />
          </label>

          {showOriginal ? (
            <>
              <label>
                Original starts
                <input type="time" value={form.original_start_time} onChange={(e) => set('original_start_time', e.target.value)} />
              </label>
              <label>
                Original ends
                <input type="time" value={form.original_end_time} onChange={(e) => set('original_end_time', e.target.value)} />
              </label>
            </>
          ) : null}

          <label className="form-full">
            Note (reason shown to students)
            <input
              value={form.status_note}
              placeholder="e.g. Teacher on leave, room changed…"
              onChange={(e) => set('status_note', e.target.value)}
            />
          </label>
        </div>

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : item ? 'Save changes' : 'Add class'}
          </button>
        </div>
      </form>
    </div>
  )
}
