import { useState, useCallback } from 'react';

import { ModalSectionContact, ModalType } from '../ResumeEditModals.types';
import { getContacts } from '../../../services/api';
import { Contact } from '../../../../../interfaces/Contact';
import { Resume } from '../../../../../interfaces/Resume';

export function useResumeEdit(initial: Resume | null) {
  const [resumeData, setResumeData] = useState<Resume | null>(initial);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSectionContact, setModalSectionContact] = useState<ModalSectionContact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const openSelectContact = useCallback(
    async (section: ModalSectionContact) => {
      setModalType('selectContact');
      setModalSectionContact(section);

      const compId =
        resumeData?.[section === 'contactCompany' ? 'company' : 'recrutingCompany']?.companyId;
      if (!compId) return; // UI zeigt vorher schon Hinweis
      const list = await getContacts(0, compId);
      setContacts(list);
      setModalOpen(true);
    },
    [resumeData]
  );

  const handleSelectContact = useCallback(
    (c: Contact) => {
      if (!modalSectionContact) return;
      setResumeData((rd) =>
        rd
          ? {
              ...rd,
              [modalSectionContact === 'contactCompany'
                ? 'contactCompany'
                : 'contactRecrutingCompany']: c,
            }
          : rd
      );
      setModalOpen(false);
      setModalType(null);
    },
    [modalSectionContact]
  );

  const openCreateContact = useCallback((section: ModalSectionContact) => {
    setModalType('editContact');
    setModalSectionContact(section);
    setModalOpen(true);
  }, []);

  const handleContactCreated = useCallback(
    (c: Contact) => {
      // nach Speichern im Formular zurück
      if (!modalSectionContact) return;
      setResumeData((rd) =>
        rd
          ? {
              ...rd,
              [modalSectionContact === 'contactCompany'
                ? 'contactCompany'
                : 'contactRecrutingCompany']: c,
            }
          : rd
      );
      setModalOpen(false);
      setModalType(null);
    },
    [modalSectionContact]
  );

  return {
    resumeData,
    setResumeData,
    modalType,
    modalOpen,
    setModalOpen,
    modalSectionContact,
    contacts,
    openSelectContact,
    handleSelectContact,
    openCreateContact,
    handleContactCreated,
  };
}
