import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import HomePage from './mainPage/HomePage'
import Documents from './mainPage/Documents'
import Lessons from './mainPage/Lessons'
import Login from './mainPage/authen/Login'
import Register from './mainPage/authen/Register'
import OAuthCallback from './mainPage/authen/OAuthCallback'
import Profile from './mainPage/Profile'
import MembershipPlans from './mainPage/MembershipPlans'
import MyMemberships from './mainPage/MyMemberships'
import UploadDocument from './mainPage/UploadDocument'
import StudyPlan from './mainPage/StudyPlan'
import PaymentResult from './mainPage/PaymentResult'
import PaymentRedirect from './mainPage/PaymentRedirect'
import TakeTest from './mainPage/test/TakeTest'
import TestDetail from './mainPage/test/TestDetail'
import AttemptResult from './mainPage/test/AttemptResult'
import LessonTestList from './mainPage/test/LessonTestList'
import TeacherDashboard from './mainPage/teacher/TeacherDashboard'
import TeacherTestForm from './mainPage/teacher/TeacherTestForm'
import TeacherTestUpdate from './mainPage/teacher/TeacherTestUpdate'

// Component để xử lý hash-based OAuth callback
function HashOAuthHandler() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Kiểm tra nếu có hash #oauth-callback
    const hash = window.location.hash
    if (hash && hash.includes('oauth-callback')) {
      // Convert hash-based URL sang path-based URL
      // #oauth-callback?token=xxx → /oauth-callback?token=xxx
      const hashWithoutHash = hash.replace('#', '')
      const [path, query] = hashWithoutHash.split('?')
      
      // Redirect đến path-based route
      const newPath = query ? `/${path}?${query}` : `/${path}`
      console.log('Converting hash-based OAuth callback to path-based:', newPath)
      navigate(newPath, { replace: true })
    }
  }, [location, navigate])

  return null
}

function AppRoutes() {
  return (
    <>
      <HashOAuthHandler />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/upload" element={<UploadDocument />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/membership" element={<MembershipPlans />} />
        <Route path="/membership-plans" element={<MembershipPlans />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-memberships" element={<MyMemberships />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/payment-redirect" element={<PaymentRedirect />} />
        <Route path="/take-test" element={<TakeTest />} />
        <Route path="/test-detail" element={<TestDetail />} />
        <Route path="/test-result" element={<AttemptResult />} />
        <Route path="/lesson-tests" element={<LessonTestList />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher-test-form" element={<TeacherTestForm />} />
        <Route path="/teacher-test-update" element={<TeacherTestUpdate />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <AppRoutes />
      </div>
    </Router>
  )
}

export default App
