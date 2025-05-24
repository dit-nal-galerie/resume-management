import React from 'react';

import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import ResumeList from './components/ResumeList';
import NewUser from './components/ResumeList';

import ResumeEdit from './components/resume/ResumeEdit';
import ChangeAccessData from './components/ChangeAccessData';
import ResetPassword from './components/ResetPassword';
import RequestPasswordReset from './components/RequestPasswordReset';



const App = () => (
  
  <BrowserRouter>
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
