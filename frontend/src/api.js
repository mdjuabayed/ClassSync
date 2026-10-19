// src/api.js — the ONE place that talks to the backend with fetch().
// Every page/component calls these four helpers instead of raw fetch,
// so error handling and JSON conversion exist in a single spot.

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // The backend always answers with JSON: data on success, { error } on failure
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data && data.error ? data.error : `Request failed (${response.status})`,
    )
  }

  return data
}

export function apiGet(path) {
  return request(path)
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body })
}

export function apiPut(path, body) {
  return request(path, { method: 'PUT', body })
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}
