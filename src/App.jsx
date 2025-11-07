import { useState, useEffect } from 'react'
import HomePage from './mainPage/HomePage'
import Login from './mainPage/authen/Login'
import Register from './mainPage/authen/Register'
import OAuthCallback from './mainPage/authen/OAuthCallback'
import Profile from './mainPage/Profile'
import MembershipPlans from './mainPage/MembershipPlans'
import MyMemberships from './mainPage/MyMemberships'
import PaymentResult from './mainPage/PaymentResult'
import PaymentRedirect from './mainPage/PaymentRedirect'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    const handleHashChange = () => {
      // Parse hash và loại bỏ query params để lấy page name
      let hash = window.location.hash.slice(1) || 'home'
      
      // Nếu hash có chứa query params (dấu ?), chỉ lấy phần trước dấu ?
      // Ví dụ: "payment-result?vnp_ResponseCode=00" → "payment-result"
      const questionMarkIndex = hash.indexOf('?')
      if (questionMarkIndex !== -1) {
        hash = hash.substring(0, questionMarkIndex)
      }
      
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

  if (currentPage === 'oauth-callback') {
    return <OAuthCallback onNavigate={handleNavigate} />
  }

  if (currentPage === 'profile') {
    return <Profile onNavigate={handleNavigate} />
  }

  if (currentPage === 'membership-plans') {
    return <MembershipPlans onNavigate={handleNavigate} />
  }

  if (currentPage === 'my-memberships') {
    return <MyMemberships onNavigate={handleNavigate} />
  }

  if (currentPage === 'payment-result') {
    return <PaymentResult onNavigate={handleNavigate} />
  }

  if (currentPage === 'payment-redirect') {
    return <PaymentRedirect />
  }

  return <HomePage onNavigate={handleNavigate} />
}

export default App
