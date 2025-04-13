# Erstellung von Verzeichnissen
Write-Output "Erstellung von Verzeichnissen..."
New-Item -ItemType Directory -Path "src"
New-Item -ItemType Directory -Path "src\components"
New-Item -ItemType Directory -Path "src\services"

# Erstellung der Datei App.tpx
Write-Output "Erstellung der Datei App.tpx..."
Set-Content -Path "src\App.tpx" -Value @"
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import Resumes from './components/Resumes';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/resumes" element={<Resumes />} />
    </Routes>
  </Router>
);

export default App;
"@

# Erstellung der Datei Login.tpx
Write-Output "Erstellung der Datei Login.tpx..."
Set-Content -Path "src\components\Login.tpx" -Value @"
import React from 'react';

const Login = () => (
  <div>
    <h1>Anmeldung</h1>
    <form>
      <label>
        Benutzername:
        <input type='text' name='login' />
      </label>
      <label>
        Passwort:
        <input type='password' name='password' />
      </label>
      <button type='submit'>Einloggen</button>
    </form>
  </div>
);

export default Login;
"@

# Erstellung der Datei Profile.tpx
Write-Output "Erstellung der Datei Profile.tpx..."
Set-Content -Path "src\components\Profile.tpx" -Value @"
import React from 'react';

const Profile = () => (
  <div>
    <h1>Profil</h1>
    <p>Anzeige und Bearbeitung des Benutzerprofils</p>
  </div>
);

export default Profile;
"@

# Erstellung der Datei Resumes.tpx
Write-Output "Erstellung der Datei Resumes.tpx..."
Set-Content -Path "src\components\Resumes.tpx" -Value @"
import React from 'react';

const Resumes = () => (
  <div>
    <h1>Lebensläufe</h1>
    <p>Liste aller Lebensläufe</p>
  </div>
);

export default Resumes;
"@

# Erstellung der Datei api.js
Write-Output "Erstellung der Datei api.js..."
Set-Content -Path "src\services\api.js" -Value @"
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const login = async (loginname, password) => {
  const response = await axios.post(\`\${API_URL}/login\`, { loginname, password });
  return response.data;
};
export const getUserData = async (loginid) => {
  const response = await axios.post(\`\${API_URL}/getUserData\`, { loginid });
  return response.data;
};
export const getResumesWithUsers = async () => {
  const response = await axios.get(\`\${API_URL}/getResumesWithUsers\`);
  return response.data;
};
"@

Write-Output "Alle Dateien wurden erfolgreich erstellt!"