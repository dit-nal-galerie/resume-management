import React, { useState, useEffect } from "react";
import { getResumesWithUsers } from "../services/api"; // API-Funktion importieren
import { Resume } from "../../../interfaces/Resume";
import { loadUserFromStorage } from "../utils/storage";
import { User } from "../../../interfaces/User";
import { useNavigate } from "react-router-dom";

const storedUser: User = loadUserFromStorage();

const ResumeList: React.FC = () => {
  const [userLoginName, setUserLoginName] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = storedUser?.loginid;

    if (userId) {
      setUserLoginName(storedUser.name || storedUser.loginname);
      getResumesWithUsers(userId)
        .then((data) => setResumes(data))
        .catch((err) => console.error("Fehler beim Laden der Bewerbungen:", err));
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-gray-800 text-white p-4 rounded-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bewerbungen - {userLoginName}</h2>
        <button
          onClick={() => navigate("/resume/0")}
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Neue Bewerbung
        </button>
      </div>

      {/* Bewerbungen als Grid-Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {resumes.map((resume) => (
          <div key={resume.resumeId} className="p-4 bg-gray-100 rounded-lg shadow-md relative">
            <h3 className="text-lg font-semibold">{resume.position}</h3>
            <p className="text-gray-600">Firma: {resume.company?.name}</p>
            <p className="text-gray-600">Mutterfirma: {resume.parentCompany?.name}</p>
            <p className="text-gray-600">Status: {resume.stateText}</p>
            <p className="text-gray-500 text-sm">Erstellt am: {resume.created}</p>

            {/* Sticky Action Buttons */}
            <div className="sticky bottom-0 flex space-x-2 mt-4">
              <button
                onClick={() => navigate(`/resume/${resume.resumeId}`)}
                className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded-md"
              >
                Anschauen/Ändern
              </button>
              <button className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded-md">
                Status ändern
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeList;