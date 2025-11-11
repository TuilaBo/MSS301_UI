const normalizeOrigin = (value) => (value ? value.replace(/\/+$/, '') : '')

const DEFAULT_ORIGIN = 'http://localhost:8888'
const API_BASE_PATH = '/api'

const shouldUseRelativeBase = import.meta.env.DEV && !import.meta.env.VITE_API_ORIGIN
const resolvedOrigin = normalizeOrigin(import.meta.env.VITE_API_ORIGIN || DEFAULT_ORIGIN)

export const API_BASE_URL = `${DEFAULT_ORIGIN}${API_BASE_PATH}`

export default {
  ORIGIN: shouldUseRelativeBase ? '' : resolvedOrigin,
  BASE_PATH: API_BASE_PATH,
  BASE_URL: API_BASE_URL,
  USE_RELATIVE: shouldUseRelativeBase,
}
