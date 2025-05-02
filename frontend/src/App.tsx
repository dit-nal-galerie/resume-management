import React from 'react';

import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import ResumeList from './components/ResumeList';
import NewUser from './components/ResumeList';
import RestoreUser from './components/restoreUser'; 
import ResumeEdit from './components/resume/ResumeEdit';



const App = () => (
  
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/resumes" element={<ResumeList />} />
      <Route path="/newUser" element={<NewUser />} />
      <Route path="/restore" element={<RestoreUser />} /> 
      <Route path="/resume/:resumeId" element={<ResumeEdit />} />
      
    </Routes>
  </BrowserRouter>
);

export default App;
