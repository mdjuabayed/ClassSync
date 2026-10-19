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
import {
  formatTimeRange,
  parseDateOnly,
  formatDate,
  formatRelativeTime,
} from '../utils/time.js'

// CrDashboard (route /cr) — the Class Representative's management area:
// add / edit / delete classes and exams, cancel classes with one click,
// publish and delete announcements. Destructive actions always ask first
// with a ConfirmDialog.
export default function CrDashboard() {
  const classesState = useApi('/api/classes')
  const examsState = useApi('/api/exams')
  const announcementsState = useApi('/api/announcements')

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
    return {
      title: 'Delete this announcement?',
      message: `"${item.title}" will be removed for everyone.`,
      label: 'Delete',
    }
  }

  const confirmDialogInfo = confirm ? confirmInfo(confirm) : null

  return (
    <div className="cr-page">
      <header className="page-header">
        <h1>CR Dashboard</h1>
        <p className="page-subtitle">
          Manage the routine, exams and announcements of the CSE-2026 batch —
          students see every change immediately.
        </p>
      </header>

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

      {/* ---------- Class routine ---------- */}
      <section className="card cr-section">
        <div className="card-header">
          <h2>Class routine</h2>
          <button
            type="button"
            className="btn btn-primary btn-small"
            onClick={() => openDialog('class')}
          >
            + Add class
          </button>
        </div>

        {classesState.loading ? <LoadingState /> : null}
        {!classesState.loading && classesState.error ? (
          <ErrorNotice message={classesState.error} />
        ) : null}
        {!classesState.loading && !classesState.error && classesState.data.length === 0 ? (
          <EmptyState
            title="No classes yet"
            message="Add the first routine entry with the button above."
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
