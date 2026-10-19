// ExamForm — modal form for adding (item = null) or editing an exam.
import { useState } from 'react'

function initialValues(item) {
  if (item) return { ...item }
  return {
    course_code: '',
    course_name: '',
    exam_type: 'Midterm',
    exam_date: '',
    start_time: '10:00',
    end_time: '12:00',
    room_number: '',
  }
}

export default function ExamForm({ item, submitting, error, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => initialValues(item))

  function set(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

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
        <h2>{item ? `Edit exam #${item.id}` : 'Add exam'}</h2>

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
            Type
            <select value={form.exam_type} onChange={(e) => set('exam_type', e.target.value)}>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Quiz 1">Quiz 1</option>
              <option value="Quiz 2">Quiz 2</option>
              <option value="Lab exam">Lab exam</option>
            </select>
          </label>
          <label>
            Date
            <input type="date" value={form.exam_date} onChange={(e) => set('exam_date', e.target.value)} required />
          </label>
          <label>
            Starts at
            <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} required />
          </label>
          <label>
            Ends at
            <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} required />
          </label>
          <label className="form-full">
            Room / hall
            <input value={form.room_number} onChange={(e) => set('room_number', e.target.value)} required />
          </label>
        </div>

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : item ? 'Save changes' : 'Add exam'}
          </button>
        </div>
      </form>
    </div>
  )
}
