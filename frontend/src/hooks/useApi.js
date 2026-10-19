// src/hooks/useApi.js — loads data from the REST API for a page.
//
// Returns { data, loading, error, refetch } — the same shape the old
// mock hook had, plus refetch() so the CR dashboard can reload a list
// after adding/editing/deleting something.
import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '../api.js'

export default function useApi(path) {
  const [state, setState] = useState({ data: [], loading: true, error: null })
  const [version, setVersion] = useState(0)

  // Calling refetch() bumps the version, which re-runs the effect below.
  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false // ignore results after unmount

    setState((previous) => ({ ...previous, loading: true, error: null }))

    apiGet(path)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: [], loading: false, error: error.message })
      })

    return () => {
      cancelled = true
    }
  }, [path, version])

  return { ...state, refetch }
}
