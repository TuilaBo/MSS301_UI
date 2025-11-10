import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './mainPage/HomePage';
import Documents from './mainPage/Documents';
import Lessons from './mainPage/Lessons';
import Login from './mainPage/authen/Login';
import MembershipPlans from './mainPage/MembershipPlans';
import UploadDocument from './mainPage/UploadDocument';
import StudyPlan from './mainPage/StudyPlan';
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
import TakeTest from './mainPage/test/TakeTest'
import TestDetail from './mainPage/test/TestDetail'
import AttemptResult from './mainPage/test/AttemptResult'
import LessonTestList from './mainPage/test/LessonTestList'
import TeacherDashboard from './mainPage/teacher/TeacherDashboard'
import TeacherTestForm from './mainPage/teacher/TeacherTestForm'
import TeacherTestUpdate from './mainPage/teacher/TeacherTestUpdate'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/upload" element={<UploadDocument />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/membership" element={<MembershipPlans />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
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

  if (currentPage === 'take-test') {
    return <TakeTest onNavigate={handleNavigate} />
  }

  if (currentPage === 'test-detail') {
    return <TestDetail onNavigate={handleNavigate} />
  }

  if (currentPage === 'test-result') {
    return <AttemptResult onNavigate={handleNavigate} />
  }

  if (currentPage === 'lesson-tests') {
    return <LessonTestList onNavigate={handleNavigate} />
  }

  if (currentPage === 'teacher-dashboard') {
    return <TeacherDashboard onNavigate={handleNavigate} />
  }

  if (currentPage === 'teacher-test-form') {
    return <TeacherTestForm onNavigate={handleNavigate} />
  }

  if (currentPage === 'teacher-test-update') {
    return <TeacherTestUpdate onNavigate={handleNavigate} />
  }

  return <HomePage onNavigate={handleNavigate} />
}

export default App;


