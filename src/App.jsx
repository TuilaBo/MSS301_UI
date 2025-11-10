import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './mainPage/HomePage';
import Documents from './mainPage/Documents';
import Lessons from './mainPage/Lessons';
import Login from './mainPage/authen/Login';
import MembershipPlans from './mainPage/MembershipPlans';
import UploadDocument from './mainPage/UploadDocument';
import StudyPlan from './mainPage/StudyPlan';

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
}

export default App;


