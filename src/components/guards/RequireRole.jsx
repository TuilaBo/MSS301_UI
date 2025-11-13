import { Navigate } from 'react-router-dom'

export default function RequireRole({ role, children }) {
  const storedRole = localStorage.getItem('role')

  if (!storedRole || storedRole !== role) {
    return <Navigate to="/home" replace />
  }

  return children
}


