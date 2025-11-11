import { useState, useEffect } from 'react'

const extractParams = () => {
  const hash = window.location.hash || ''
  const [, queryString] = hash.split('?')
  return new URLSearchParams(queryString || '')
}

export function useHashParams() {
  const [params, setParams] = useState(() => extractParams())

  useEffect(() => {
    const handler = () => setParams(extractParams())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  return params
}

