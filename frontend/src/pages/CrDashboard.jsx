import { useEffect, useState } from 'react'
import useApi from '../hooks/useApi.js'
import { apiPost, apiPut, apiDelete } from '../api.js'
import ClassForm from '../components/ClassForm.jsx'
import ExamForm from '../components/ExamForm.jsx'
import AnnouncementForm from '../components/AnnouncementForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorNotice from '../components/ErrorNotice.jsx'
import LoginForm from '../components/LoginForm.jsx'
import {
  formatTimeRange,
  parseDateOnly,
  formatDate,
  formatRelativeTime,
} from '../utils/time.js'

// CrDashboard (route /cr) — the Class Representative's management area.
//
// TODAY / TOMORROW show the EFFECTIVE schedule for that exact date: the
// weekly routine plus any one-day override. Changes made here (Change /
// Revert) only touch class_overrides — the FINAL weekly routine is never
// altered. The CR can still add / edit / delete the final routine below.
export default function CrDashboard() {
  const classesState = useApi('/api/classes')
  const examsState = useApi('/api/exams')
  const announcementsState = useApi('/api/announcements')

  // Today / tomorrow as YYYY-MM-DD for the /api/classes/on endpoint
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const todayName = new Date(today).toLocaleDateString('en-US', { weekday: 'long' })
  const tomorrowName = new Date(tomorrow).toLocaleDateString('en-US', { weekday: 'long' })

  // Effective classes for today and tomorrow (routine + one-day overrides)
  const todayState = useApi(`/api/classes/on?date=${today}`)
  const tomorrowState = useApi(`/api/classes/on?date=${tomorrow}`)


  // Session info: { user } when signed in, { user: null } for visitors
  const authState = useApi('/api/auth/me')
  const user = authState.data && authState.data.user ? authState.data.user : null
  const canManage = user !== null && user.role === 'cr'

  // dialog = which form is open ({ kind, item }); item null = "add new"
  const [dialog, setDialog] = useState(null)
  // confirm = which destructive action is waiting for confirmation
  const [confirm, setConfirm] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [flash, setFlash] = useState(null) // { type, text }

  // Success messages disappear after 5 seconds
  useEffect(() => {
    if (!flash) return undefined
    const timer = setTimeout(() => setFlash(null), 5000)
    return () => clearTimeout(timer)
  }, [flash])

  function openDialog(kind, item = null) {
    setFormError(null)
    setDialog({ kind, item })
  }

  async function handleLogout() {
    try {
      await apiPost('/api/auth/logout', {})
    } finally {
      authState.refetch() // /api/auth/me now returns { user: null }
    }
  }

  // ---------- saves (create / update) ----------
  async function saveClass(values) {
    setSubmitting(true)
    setFormError(null)
    try {
      if (dialog.item) {
        await apiPut(`/api/classes/${dialog.item.id}`, values)
        setFlash({ type: 'success', text: 'Class updated.' })
      } else {
        await apiPost('/api/classes', values)
        setFlash({ type: 'success', text: 'Class added to the routine.' })
      }
      setDialog(null)
      classesState.refetch()
    } catch (error) {
      setFormError(error.message) // stays inside the open form
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- one-day changes (today / tomorrow) ----------

  async function saveOverride(item, date, values) {
    setFormError(null)
    try {
      await apiPut(`/api/classes/${item.class_id}/override`, {
        override_date: date,
        ...values,
      })
      todayState.refetch()
      tomorrowState.refetch()
      setFlash({
        type: 'success',
        text: `One-day change saved for ${date} — shown to students, not part of the final routine.`,
      })
    } catch (error) {
      setFlash({ type: 'error', text: error.message })
    }
  }

  async function revertOverride(item, date) {
    try {
      await apiDelete(`/api/classes/${item.class_id}/override?date=${encodeURIComponent(date)}`)
      todayState.refetch()
      tomorrowState.refetch()
      setFlash({ type: 'success', text: `Override reverted for ${date} — back to the weekly routine.` })
    } catch (error) {
      setFlash({ type: 'error', text: error.message })
    }
  }

  async function saveExam(values) {
    setSubmitting(true)
    setFormError(null)
    try {
      if (dialog.item) {
        await apiPut(`/api/exams/${dialog.item.id}`, values)
        setFlash({ type: 'success', text: 'Exam updated.' })
      } else {
        await apiPost('/api/exams', values)
        setFlash({ type: 'success', text: 'Exam added.' })
      }
      setDialog(null)
      examsState.refetch()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function publishAnnouncement(values) {
    setSubmitting(true)
    setFormError(null)
    try {
      await apiPost('/api/announcements', values)
      setDialog(null)
      setFlash({ type: 'success', text: 'Announcement published.' })
      announcementsState.refetch()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // ---------- destructive actions (run after confirmation) ----------
  async function runConfirmedAction(action) {
    setSubmitting(true)
    try {
      if (action.kind === 'cancel') {
        await apiPost(`/api/classes/${action.item.id}/cancel`, {})
        setFlash({ type: 'success', text: 'Class cancelled — students can see the status now.' })
        classesState.refetch()
      } else if (action.kind === 'class') {
        await apiDelete(`/api/classes/${action.item.id}`)
        setFlash({ type: 'success', text: 'Class removed from the routine.' })
        classesState.refetch()
      } else if (action.kind === 'exam') {
        await apiDelete(`/api/exams/${action.item.id}`)
        setFlash({ type: 'success', text: 'Exam removed.' })
        examsState.refetch()
      } else if (action.kind === 'announcement') {
        await apiDelete(`/api/announcements/${action.item.id}`)
        setFlash({ type: 'success', text: 'Announcement deleted.' })
        announcementsState.refetch()
      } else if (action.kind === 'revert') {
        await revertOverride(action.item, action.date)
        setConfirm(null)
        return
      }
      setConfirm(null)
    } catch (error) {
      setFlash({ type: 'error', text: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  // Text shown inside the confirmation dialog for each action kind
  function confirmInfo(action) {
    const item = action.item
    if (action.kind === 'cancel') {
      return {
        title: 'Cancel this class?',
        message: `${item.course_code} on ${item.day_of_week} will be shown as CANCELLED to every student. You can restore it later by editing the entry.`,
        label: 'Cancel the class',
      }
    }
    if (action.kind === 'class') {
      return {
        title: 'Delete this class?',
        message: `${item.course_code} ${item.course_name} (${item.day_of_week} ${formatTimeRange(item.start_time, item.end_time)}) will be removed from the routine permanently.`,
        label: 'Delete',
      }
    }
    if (action.kind === 'exam') {
      return {
        title: 'Delete this exam?',
        message: `${item.course_code} ${item.exam_type} on ${formatDate(parseDateOnly(item.exam_date))} will be removed.`,
        label: 'Delete',
      }
    }
    if (action.kind === 'revert') {
      return {
        title: 'Revert this one-day change?',
        message: `${item.course_code} on ${action.date} will go back to the weekly routine value. Students will see the routine time/room again.`,
        label: 'Revert to routine',
      }
    }
    return {
      title: 'Delete this announcement?',
      message: `"${item.title}" will be removed for everyone.`,
      label: 'Delete',
    }
  }

  // One day's effective classes, with per-row Change / Revert buttons.
  // Changes here write to class_overrides only — never to the weekly routine.
  const STATUSES = ['scheduled', 'cancelled', 'rescheduled']

  // Inline one-day row editor for Today / Tomorrow. Writes to class_overrides only.
  function DayRow({ row, date }) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ start_time: row.start_time, end_time: row.end_time, room_number: row.room_number, status: row.status, status_note: row.status_note || '' })
    const [saving, setSaving] = useState(false)
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const set = (field, value) => setForm((p) => ({ ...p, [field]: value }))
    const is = { font: 'inherit', fontSize: '0.92rem', padding: '0.5rem 0.6rem', border: '1px solid var(--border)', borderRadius: '8px', width: '100%', background: '#fff' }
    const ls = { display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }

    async function handleSave(e) {
      e.preventDefault(); setSaving(true)
      try { await saveOverride(row, date, form); setEditing(false) }
      catch (err) { setFlash({ type: 'error', text: err.message }) }
      finally { setSaving(false) }
    }
    async function handleRevert() {
      if (confirmingRevert) { setConfirmingRevert(false); try { await revertOverride(row, date) } catch (err) { setFlash({ type: 'error', text: err.message }) } }
      else { setConfirmingRevert(true) }
    }

    return (
      <div className="cr-row">
        <div className="cr-row-main">
          {editing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.6rem', alignItems: 'end' }}>
                <label style={ls}>Start <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} required style={is} /></label>
                <label style={ls}>End <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} required style={is} /></label>
                <label style={ls}>Room <input value={form.room_number} onChange={(e) => set('room_number', e.target.value)} required style={is} /></label>
              </div>
              <div style={{ marginTop: '0.4rem' }}>
                <label style={ls}>Status <select value={form.status} onChange={(e) => set('status', e.target.value)} style={is}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
              </div>
              <div style={{ marginTop: '0.4rem' }}>
                <label style={ls}>Note <input value={form.status_note} onChange={(e) => set('status_note', e.target.value)} placeholder="e.g. Room 405 today" style={is} /></label>
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-small" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-small" disabled={saving}>{saving ? 'Saving…' : 'Save change'}</button>
              </div>
            </form>
          ) : (
            <>
              <p className="item-title">{row.course_code} · {row.course_name}</p>
              <p className="item-meta">{formatTimeRange(row.start_time, row.end_time)} · {row.room_number} · {row.teacher_name}</p>
              {row.status_note ? <p className="item-note">{row.status_note}</p> : null}
              {row.is_override ? <p className="item-note" style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '0.25rem' }}>⚡ One-day change for {row.override_date}</p> : null}
            </>
          )}
        </div>
        <div className="cr-row-side">
          <StatusBadge status={editing ? form.status : row.status} />
          <div className="cr-actions">
            {!editing ? (
              <>
                <button type="button" className="btn btn-secondary btn-small" onClick={() => { setForm({ start_time: row.start_time, end_time: row.end_time, room_number: row.room_number, status: row.status, status_note: row.status_note || '' }); setEditing(true) }}>Edit</button>
                {row.is_override ? <button type="button" className="btn btn-warn btn-small" onClick={handleRevert}>{confirmingRevert ? 'Confirm revert' : 'Revert'}</button> : null}
                {confirmingRevert && <button type="button" className="btn btn-secondary btn-small" onClick={() => setConfirmingRevert(false)}>Cancel</button>}
              </>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  function daySection({ title, subtitle, date, state }) {
    // `date` is used by the Change / Revert handlers below
    return (
      <section className="card cr-section">
        <div className="card-header">
          <h2>{title}</h2>
          <span className="card-subtitle">{subtitle}</span>
        </div>

        {state.loading ? <LoadingState /> : null}
        {!state.loading && state.error ? <ErrorNotice message={state.error} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <EmptyState title="No classes" message="No classes scheduled for this day." />
        ) : null}
        {!state.loading && !state.error && state.data.length > 0 ? (
          <div className="cr-list">
            {state.data.map((row) => (
              <DayRow key={row.class_id} row={row} date={date} />
            ))}
          </div>
        ) : null}
      </section>
    )
  }

  // ---- Access gate: runs BEFORE the management UI, after all hooks ----
  if (authState.loading) {
    return (
      <div className="cr-page">
        <CrHeader />
        <LoadingState label="Checking your session…" />
      </div>
    )
  }

  if (authState.error) {
    return (
      <div className="cr-page">
        <CrHeader />
        <ErrorNotice message={authState.error} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="cr-page">
        <CrHeader />
        <LoginForm onSuccess={() => authState.refetch()} />
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="cr-page">
        <CrHeader />
        <div className="empty-state">
          <p className="empty-title">
            Signed in as {user.name} — student account
          </p>
          <p>
            Only the Class Representative can manage data here. Students can
            view everything on the other pages.
          </p>
        </div>
      </div>
    )
  }

  const confirmDialogInfo = confirm ? confirmInfo(confirm) : null

  return (
    <div className="cr-page">
      <CrHeader />

      <div className="cr-user">
        <span>
          Signed in as <strong>{user.name}</strong> (CR)
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>

      {flash ? (
        <div
          className={`flash flash--${flash.type}`}
          role={flash.type === 'error' ? 'alert' : 'status'}
        >
          <span>{flash.text}</span>
          <button
            type="button"
            onClick={() => setFlash(null)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* ---------- Today ---------- */}
      {daySection({
        title: `Today’s classes · ${todayName}`,
        subtitle: today,
        date: today,
        state: todayState,
      })}

      {/* ---------- Tomorrow ---------- */}
      {daySection({
        title: `Tomorrow’s classes · ${tomorrowName}`,
        subtitle: tomorrow,
        date: tomorrow,
        state: tomorrowState,
      })}

      {/* ---------- Final weekly routine ---------- */}
      <section className="card cr-section">
        <div className="card-header">
          <h2>Final weekly routine</h2>
          <p className="card-subtitle">
            This is THE routine students see on /routine. Add, edit or delete
            entries here — one-day changes above never touch it.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => openDialog('class')}
          >
            + Add class to routine
          </button>
        </div>

        {classesState.loading ? <LoadingState /> : null}
        {!classesState.loading && classesState.error ? (
          <ErrorNotice message={classesState.error} />
        ) : null}
        {!classesState.loading && !classesState.error && classesState.data.length === 0 ? (
          <EmptyState
            title="No routine yet"
            message="Add the first weekly entry with the button above."
          />
        ) : null}
        {!classesState.loading && !classesState.error && classesState.data.length > 0 ? (
          <div className="cr-list">
            {classesState.data.map((row) => (
              <div key={row.id} className="cr-row">
                <div className="cr-row-main">
                  <p className="item-title">
                    {row.course_code} · {row.course_name}
                  </p>
                  <p className="item-meta">
                    {row.day_of_week} ·{' '}
                    {formatTimeRange(row.start_time, row.end_time)} ·{' '}
                    {row.room_number} · {row.teacher_name}
                  </p>
                  {row.status_note ? (
                    <p className="item-note">{row.status_note}</p>
                  ) : null}
                </div>
                <div className="cr-row-side">
                  <StatusBadge status={row.status} />
                  <div className="cr-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => openDialog('class', row)}
                    >
                      Edit
                    </button>
                    {row.status !== 'cancelled' ? (
                      <button
                        type="button"
                        className="btn btn-warn btn-small"
                        onClick={() => setConfirm({ kind: 'cancel', item: row })}
                      >
                        Cancel
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => setConfirm({ kind: 'class', item: row })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* ---------- Exams ---------- */}
      <section className="card cr-section">
        <div className="card-header">
          <h2>Exams</h2>
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => openDialog('exam')}
          >
            + Add exam
          </button>
        </div>

        {examsState.loading ? <LoadingState /> : null}
        {!examsState.loading && examsState.error ? (
          <ErrorNotice message={examsState.error} />
        ) : null}
        {!examsState.loading && !examsState.error && examsState.data.length === 0 ? (
          <EmptyState
            title="No exams scheduled"
            message="Add the first exam with the button above."
          />
        ) : null}
        {!examsState.loading && !examsState.error && examsState.data.length > 0 ? (
          <div className="cr-list">
            {examsState.data.map((row) => (
              <div key={row.id} className="cr-row">
                <div className="cr-row-main">
                  <p className="item-title">
                    {row.course_code} · {row.course_name} — {row.exam_type}
                  </p>
                  <p className="item-meta">
                    {formatDate(parseDateOnly(row.exam_date))} ·{' '}
                    {formatTimeRange(row.start_time, row.end_time)} ·{' '}
                    {row.room_number}
                  </p>
                </div>
                <div className="cr-row-side">
                  <div className="cr-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => openDialog('exam', row)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => setConfirm({ kind: 'exam', item: row })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* ---------- Announcements ---------- */}
      <section className="card cr-section">
        <div className="card-header">
          <h2>Announcements</h2>
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => openDialog('announcement')}
          >
            + New announcement
          </button>
        </div>

        {announcementsState.loading ? <LoadingState /> : null}
        {!announcementsState.loading && announcementsState.error ? (
          <ErrorNotice message={announcementsState.error} />
        ) : null}
        {!announcementsState.loading && !announcementsState.error && announcementsState.data.length === 0 ? (
          <EmptyState
            title="No announcements yet"
            message="Publish the first notice with the button above."
          />
        ) : null}
        {!announcementsState.loading && !announcementsState.error && announcementsState.data.length > 0 ? (
          <div className="cr-list">
            {announcementsState.data.map((row) => (
              <div key={row.id} className="cr-row">
                <div className="cr-row-main">
                  <p className="item-title">{row.title}</p>
                  <p className="item-meta">
                    {row.author_name || 'CR'} ·{' '}
                    {formatRelativeTime(row.created_at)}
                  </p>
                </div>
                <div className="cr-row-side">
                  <div className="cr-actions">
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() =>
                        setConfirm({ kind: 'announcement', item: row })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* ---------- Open dialogs ---------- */}

      {dialog && dialog.kind === 'class' ? (
        <ClassForm
          item={dialog.item}
          submitting={submitting}
          error={formError}
          onSubmit={saveClass}
          onCancel={() => setDialog(null)}
        />
      ) : null}

      {dialog && dialog.kind === 'exam' ? (
        <ExamForm
          item={dialog.item}
          submitting={submitting}
          error={formError}
          onSubmit={saveExam}
          onCancel={() => setDialog(null)}
        />
      ) : null}

      {dialog && dialog.kind === 'announcement' ? (
        <AnnouncementForm
          submitting={submitting}
          error={formError}
          onSubmit={publishAnnouncement}
          onCancel={() => setDialog(null)}
        />
      ) : null}

      {confirm && confirmDialogInfo ? (
        <ConfirmDialog
          title={confirmDialogInfo.title}
          message={confirmDialogInfo.message}
          confirmLabel={confirmDialogInfo.label}
          onConfirm={() => runConfirmedAction(confirm)}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
    </div>
  )
}

// Shared page heading used by every return path (login gate included)
function CrHeader() {
  return (
    <header className="page-header">
      <h1>CR Dashboard</h1>
      <p className="page-subtitle">
        Manage the routine, exams and announcements of the CSE-2025 batch —
        students see every change immediately.
      </p>
    </header>
  )
}
