import { useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// useMockFetch — pretends to be a network request so we can build the UI
// before the backend exists (Stage 1).
//
// It returns: { data, loading, error }
//
// In Stage 4 the Promise below is replaced with a real request:
//
//   const response = await fetch('/api/classes')
//   if (!response.ok) throw new Error(`Request failed (${response.status})`)
//   resolve(await response.json())
//
// Because the returned shape stays identical, the page components will not
// need to change — only this one file.
// ---------------------------------------------------------------------------

export default function useMockFetch(source, delay = 600) {
  const [state, setState] = useState({ data: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false // guards against state updates after unmount

    const load = () =>
      new Promise((resolve) => {
        // Simulates network latency so the loading state is visible
        setTimeout(() => resolve(source), delay)
      })

    load()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: [], loading: false, error: error.message })
        }
      })

    // Cleanup runs when the component unmounts or the source changes
    return () => {
      cancelled = true
    }
  }, [source, delay])

  return state
}
