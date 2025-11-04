import { useState, useEffect } from 'react'
import HomePage from './mainPage/HomePage'
import Login from './mainPage/authen/Login'
import Register from './mainPage/authen/Register'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home'
      setCurrentPage(hash)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigate = (page) => {
    window.location.hash = page
    setCurrentPage(page)
  }

  if (currentPage === 'login') {
    return <Login onNavigate={handleNavigate} />
  }

  if (currentPage === 'register') {
    return <Register onNavigate={handleNavigate} />
  }

  return <HomePage onNavigate={handleNavigate} />
}

export default App
