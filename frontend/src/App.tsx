import React from 'react';



import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Profile from './components/profile/Profile';
import Login from './components/login/Login';

import RequestPasswordReset from './components/login/RequestPasswordReset';
import ResetPassword from './components/login/ResetPassword';
import ResumeList from './components/ResumeList';
import ChangeAccessData from './components/profile/ChangeAccessData';
import ResumeEditContainer from './components/resume/ResumeEditContainer';
import { PageLoader } from './components/ui/Loader';

/**
 * Die Haupt-App-Komponente, die das Routing und die globale Layout-Elemente verwaltet.
 * Verwendet React Router Dom v6 für die Navigation.
 */
const App: React.FC = () => (
  // Explizite Typisierung als React.FC ist guter Stil
  // BrowserRouter stellt den Routing-Kontext für die gesamte Anwendung bereit.
  <BrowserRouter>
    <Routes>
      {/* Route für die Startseite und die explizite Login-Seite */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Route für die Profilseite des Benutzers */}
      <Route path="/profile" element={<Profile />} />

      {/* Route für die Anzeige der Liste der Lebensläufe */}
      <Route path="/resumes" element={<ResumeList />} />
      {/* Route für die Bearbeitung eines spezifischen Lebenslaufs, mit einem dynamischen Parameter ':resumeId' */}
      <Route path="/resume/:resumeId" element={<ResumeEditContainer initial={null} />} />

      {/* Route zum Ändern von Zugangsdaten */}
      <Route path="/changeaccess" element={<ChangeAccessData />} />

      {/* Route zur Anforderung einer Passwortzurücksetzung */}
      <Route path="/restore" element={<RequestPasswordReset />} />

      {/* Route zum Zurücksetzen des Passworts nach Anforderung */}
      <Route path="/reset-password" element={<ResetPassword />} />    </Routes>
  </BrowserRouter>
);

export default App;
