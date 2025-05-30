import React, { useEffect, useState } from "react";
import { User } from "../../../interfaces/User";
import { loadUserFromStorage } from "../utils/storage";
import { useNavigate } from "react-router-dom";
import { updateAccessData } from "../services/api";


const ChangeAccessData: React.FC = () => {
  const [formData, setFormData] = useState({
    loginname: "",
    email: "",
    password: "",
    password2: "",
    oldPassword: "",
    changePassword: false,
  });
  const loginUser:User= loadUserFromStorage();
useEffect(() => {

 setFormData({loginname: loginUser.loginname, email: loginUser.email, password: "", password2: "", oldPassword: "", changePassword: false});
}, []);
  const handleFieldChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
    const navigate = useNavigate();
const handleBack = () => {
    navigate('/resumes');
  };
  const handleSave = async () => {
  try {
    const response = await updateAccessData({ ...formData, userId: loginUser.loginid }); // API-Aufruf
    if (response.success) {
      // Benutzer neu setzen
      localStorage.setItem("user", JSON.stringify(response.user)); // vom Backend zurück
      alert("Zugangsdaten erfolgreich aktualisiert.");
      navigate("/resumes"); // oder auf aktueller Seite bleiben
    } else {
      alert("Fehler: " + response.message);
    }
  } catch (error) {
    alert("Fehler beim Speichern.");
    console.error(error);
  }
};


  return (
 <form  className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Zugangsdaten ändern</h2>

      {/* Loginname */}
      <div>
        <label htmlFor="loginname" className="block text-sm font-medium text-gray-700">
          Benutzername
        </label>
        <input
          id="loginname"
          type="text"
          value={formData.loginname}
          onChange={(e) => handleFieldChange("loginname", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Benutzername"
        />
      </div>

      {/* E-Mail */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="E-Mail-Adresse"
        />
      </div>

      {/* Checkbox Passwort ändern */}
      <div className="flex items-center space-x-2">
        <input
          id="changePassword"
          type="checkbox"
          checked={formData.changePassword}
          onChange={(e) => handleFieldChange("changePassword", e.target.checked)}
        />
        <label htmlFor="changePassword" className="text-sm text-gray-700">Passwort ändern</label>
      </div>

      {/* Neue Passwörter nur wenn gecheckt */}
      {formData.changePassword && (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Neues Passwort
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleFieldChange("password", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Neues Passwort"
            />
          </div>
          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
              Passwort wiederholen
            </label>
            <input
              id="password2"
              type="password"
              value={formData.password2}
              onChange={(e) => handleFieldChange("password2", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Passwort wiederholen"
            />
          </div>
          
        </>
      )}

      {/* Altes Passwort / Passwort */}
      <div>
        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
          {formData.changePassword ? "Altes Passwort" : "Passwort"}
        </label>
        <input
          id="oldPassword"
          type="password"
          value={formData.oldPassword}
          onChange={(e) => handleFieldChange("oldPassword", e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder={formData.changePassword ? "Altes Passwort eingeben" : "Passwort eingeben"}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-md "
        >
          Speichern
        </button>
        <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded-md"
            onClick={handleBack}
          >
            Zurück
          </button>
      </div>
   </form> 
  );
};

export default ChangeAccessData;
