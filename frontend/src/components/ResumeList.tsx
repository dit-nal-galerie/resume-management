import React, { useState, useEffect } from "react";
import { getResumesWithUsers } from "../services/api";
import { Resume } from "../../../interfaces/Resume";
import { loadUserFromStorage } from "../utils/storage";
import { User } from "../../../interfaces/User";
import { useNavigate } from "react-router-dom";
import { HistoryModal } from "./resume/HistoryModal";
import { StatusModal } from "./resume/StatusModal";
import { Menu, MenuButton } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";


const storedUser: User = loadUserFromStorage();

const ResumeList: React.FC = () => {
  const [userLoginName, setUserLoginName] = useState(storedUser.name ||storedUser.loginname);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Umbenannt, um klarer zu sein
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
 const [isModalStatusOpen, setIisModalStatusOpen] = useState(false);

 const [refresh, setRefresh] = useState(false);

const refreshResumes = () => {
  const userId = storedUser?.loginid;
  if (userId) {
    getResumesWithUsers(userId)
      .then((data) => setResumes(data))
      .catch((err) => console.error("Fehler beim Laden der Bewerbungen:", err));
  }
};

  const navigate = useNavigate();

useEffect(() => {
   console.log("🔁 Resumes neu laden...");
  refreshResumes();
}, [refresh]);

  const openHistoryModal = (resume: Resume) => {
    setSelectedResume(resume);
    setIsModalOpen(true); // Geändert
  };
const handleStatusChanged = () => {
  setRefresh((prev) => !prev); // Toggle -> löst useEffect aus
};
  const openStatusModal = (resume: Resume) => {
    setSelectedResume(resume);
    console.log("openStatusModal", resume, "status", resume.stateId);
    setIisModalStatusOpen(true); // Geändert
  };

  const closeHistoryModal = () => {
    setIsModalOpen(false); // Hinzugefügt
    setSelectedResume(null); // Zurücksetzen des ausgewählten Resumes
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
     
<div className="sticky top-0 bg-gray-800 text-white p-4 rounded-lg flex justify-between items-center">
  <h2 className="text-xl font-semibold">Bewerbungen – {userLoginName}</h2>

  <Menu as="div" className="relative inline-block text-left">
    <MenuButton className="inline-flex justify-center w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium">
      Menü
      <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
    </MenuButton >

    <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
      <div className="py-1">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => navigate("/resume/0")}
              className={`${
                active ? "bg-gray-100" : ""
              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
            >
              Neue Bewerbung
            </button>
          )}
        </Menu.Item>

        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => navigate("/profile")}
              className={`${
                active ? "bg-gray-100" : ""
              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
            >
              Profil editieren
            </button>
          )}
        </Menu.Item>

        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => navigate("/changeaccess")} // passe Route für Zugangsdaten an
              className={`${
                active ? "bg-gray-100" : ""
              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
            >
              Zugangsdaten ändern
            </button>
          )}
        </Menu.Item>

        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => navigate("/about")} // passe Route für „Über“ an
              className={`${
                active ? "bg-gray-100" : ""
              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
            >
              Über
            </button>
          )}
        </Menu.Item>
      </div>
    </Menu.Items>
  </Menu>
</div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {resumes.map((resume) => (
          <div
            key={resume.resumeId}
            className="p-4 bg-gray-100 rounded-lg shadow-md relative"
          >
            <h3 className="text-lg font-semibold">{resume.position}</h3>
            <p className="text-gray-600">Firma: {resume.company?.name}</p>
            <p className="text-gray-600">Recruting: {resume.recrutingCompany?.name}</p>
            <p className="text-gray-600">Status: {resume.stateText}</p>
            <p className="text-gray-500 text-sm">Erstellt am: {resume.created}</p>

          
            <div className="sticky bottom-0 flex space-x-2 mt-4">
              <button
                onClick={() => navigate(`/resume/${resume.resumeId}`)}
                className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded-md"
              >
                Anschauen/Ändern
              </button>
              <button
                onClick={() => openStatusModal(resume)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded-md"
              >
                Status ändern
              </button>
             {resume&&resume.resumeId>0 && (<button
                onClick={() => openHistoryModal(resume)}
                className="bg-gray-600 hover:bg-gray-800 text-white px-3 py-1 rounded-md"
              >
                Historie
              </button> )}
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && selectedResume&& (
      <HistoryModal
      isOpen= {isModalOpen} // Verwenden Sie den Zustand isModalOpen,
        onClose={closeHistoryModal} // Verwenden Sie die neue closeHistoryModal Funktion
        resumeId={selectedResume.resumeId  } // Verwenden Sie selectedResume
        refId={storedUser.loginid}
        resumeTitle={selectedResume.position || ""} // Verwenden Sie selectedResume
         currentStateId={selectedResume.stateId || 0} // Verwenden Sie selectedResume;
      />)}

            {/* StatusModal */}
      {selectedResume &&isModalStatusOpen && (


        <StatusModal
  isOpen={true}
   onClose={() => setIisModalStatusOpen(false)}
  resumeId={selectedResume.resumeId}
  refId={storedUser.loginid}
  resumeTitle={selectedResume.position || ""}
          currentStateId={selectedResume.stateId || 0}
  onStatusChanged={handleStatusChanged}
/>
      )}
    </div>
  );
};

export default ResumeList;