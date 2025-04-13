import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import Resumes from './components/Resumes';
import NewUser from './components/Resumes';
import RestoreUser from './components/restoreUser'; 
import Resume from './components/Resume';


const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/resumes" element={<Resumes />} />
      <Route path="/newUser" element={<NewUser />} />
      <Route path="/restore" element={<RestoreUser />} /> 
      <Route path="/resume/:resumeId" element={<Resume />} />

    </Routes>
  </Router>
);

export default App;
