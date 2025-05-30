import React from 'react';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import ResumeList from './components/ResumeList';
import NewUser from './components/ResumeList';
import ResumeEdit from './components/resume/ResumeEdit';
import ChangeAccessData from './components/ChangeAccessData';
import ResetPassword from './components/ResetPassword';
import RequestPasswordReset from './components/RequestPasswordReset';
import LanguageSwitcher from './components/LanguageSwitcher';
import Profile from './components/Profile';

const App = () => (
  <BrowserRouter>
    <div className="fixed top-4 right-4 z-50">
      <LanguageSwitcher />
    </div>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/resumes" element={<ResumeList />} />
      <Route path="/newUser" element={<NewUser />} />
      <Route path="/resume/:resumeId" element={<ResumeEdit />} />
      <Route path="/changeaccess" element={<ChangeAccessData />} /> 
      <Route path="/restore" element={<RequestPasswordReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  </BrowserRouter>
);

export default App;
