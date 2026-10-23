import { useEffect, useState } from 'react'

// Calls our API and returns the JSON. Throws an Error (with the server's message) if it failed.
// credentials: 'include' sends the login cookie along, so the server knows who we are.
export async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) throw new Error(data?.error ?? `Request failed (${response.status})`)
  return data
}

// Custom hook: fetch some data when the component first appears.
//   const { data, error, isLoading } = useApi('/api/services')
export function useApi(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If the component disappears before the answer arrives, ignore the answer.
    let ignore = false

    apiFetch(path)
      .then((result) => !ignore && setData(result))
      .catch((err) => !ignore && setError(err.message))

    return () => {
      ignore = true
    }
  }, [path])

  return { data, error, isLoading: data === null && error === null }
}
