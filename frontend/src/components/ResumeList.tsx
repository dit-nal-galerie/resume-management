import React, { useState, useEffect, useRef } from 'react';

import { Resume } from '../../../interfaces';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import PageHeader from './ui/PageHeader';
import { PageId } from './ui/PageId';
import { HistoryModal } from './resume/modals/HistoryModal';
import { StatusModal } from './resume/modals/StatusModal';
import { getResumesWithUsers, getUserAnredeAndName } from '../shared/api/queries';

const ResumeList: React.FC = () => {
  const { t } = useTranslation();

  // const [userLoginName] = useState(storedUser.name || storedUser.loginname);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isModalStatusOpen, setIisModalStatusOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // Dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [storedUser, setStoredUser] = useState<{ name: string; anredeText: string } | null>(null);

  useEffect(() => {
    getUserAnredeAndName()
      .then(setStoredUser)
      .catch(() => setStoredUser(null));
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    getResumesWithUsers()
      .then((data) => setResumes(data))
      .catch((err) => console.error(t('resumeList.loadError'), err));
  }, [refresh, t]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Prüfe, ob Klick außerhalb von Menü UND Button war
      if (
        menuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpen]);
  // Position menu below button
  const handleMenuOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
    setMenuOpen(true);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuOpen) setMenuOpen(false);
    };
    if (menuOpen) {
      setTimeout(() => document.addEventListener('mousedown', handleClick), 0);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpen]);

  const openHistoryModal = (resume: Resume) => {
    setSelectedResume(resume);
    setIsModalOpen(true);
  };
  const handleStatusChanged = () => setRefresh((prev) => !prev);
  const openStatusModal = (resume: Resume) => {
    setSelectedResume(resume);
    setIisModalStatusOpen(true);
  };
  const closeHistoryModal = () => {
    setIsModalOpen(false);
    setSelectedResume(null);
  };

  const pageTitle = `${t('resumeList.title')} - ${storedUser?.anredeText ? t(storedUser?.anredeText) : ''} ${storedUser?.name || ''}`;

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-md">
      <PageHeader pageTitle={pageTitle} pageId={PageId.ResumeList} />
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {resumes.map((resume) => (
          // console.log('Rendering resume:', JSON.stringify(resume, null, 2)),
          <div key={resume.resumeId} className="relative rounded-lg bg-gray-100 p-4 shadow-md">
            <h3 className="text-lg font-semibold">{resume.position}</h3>
            <p className="text-gray-600">
              {t('resumeList.company')}: {resume.company?.name}
            </p>
            <p className="text-gray-600">
              {t('resumeList.recruiting')}: {resume.recrutingCompany?.name || ''}
            </p>
            <p className="text-gray-600">
              {t('common.status')}: {t(resume.stateText)}
            </p>
            <p className="text-sm text-gray-500">
              {t('resumeList.createdAt')}: {resume.created}
            </p>

            <div className="sticky bottom-0 mt-4 flex space-x-2">
              <button
                onClick={() => navigate(`/resume/${resume.resumeId}`)}
                className="rounded-md bg-green-500 px-3 py-1 text-white hover:bg-green-700"
              >
                {t('resumeList.viewEdit')}
              </button>
              <button
                onClick={() => openStatusModal(resume)}
                className="rounded-md bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-700"
              >
                {t('resumeList.changeStatus')}
              </button>
              {resume && resume.resumeId > 0 && (
                <button
                  onClick={() => openHistoryModal(resume)}
                  className="rounded-md bg-gray-600 px-3 py-1 text-white hover:bg-gray-800"
                >
                  {t('resumeList.history')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && selectedResume && (
        <HistoryModal
          isOpen={isModalOpen}
          onClose={closeHistoryModal}
          resumeId={selectedResume.resumeId}
          refId={0}
          resumeTitle={selectedResume.position || ''}
          currentStateId={selectedResume.stateId || 0}
        />
      )}

      {/* StatusModal */}
      {selectedResume && isModalStatusOpen && (
        <StatusModal
          isOpen={true}
          onClose={() => setIisModalStatusOpen(false)}
          resumeId={selectedResume.resumeId}
          refId={0}
          resumeTitle={selectedResume.position || ''}
          currentStateId={selectedResume.stateId || 0}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </div>
  );
};

export default ResumeList;
