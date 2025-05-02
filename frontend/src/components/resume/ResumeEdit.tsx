// ResumeEdit.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Resume } from '../../../../interfaces/Resume';
import { User } from '../../../../interfaces/User';
import { getCompanies, getContacts, getResumeById, getStates, updateOrCreateResume } from '../../services/api';
import { loadUserFromStorage } from '../../utils/storage';
import { Modal } from 'react-bootstrap';
import CompanyFormModal from '../company/CompanyFormModal';
import CompanySelectModal from '../company/CompanySelectModal';
import { Company } from '../../../../interfaces/Company';
import CompanySection from '../company/companySelection';
import ContactSection from '../contact/ContactSection';
import { Contact } from '../../../../interfaces/Contact';
import ContactFormModal from '../contact/ContactFormModal';

import { ModalSectionCompany, ModalSectionContact, ModalType } from './ResumeEditModals.types';
const ResumeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams<{ resumeId: string }>();
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [statusList, setStatusList] = useState<{ stateid: number; text: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const storedUser: User = loadUserFromStorage();
  const [modalOpen, setModalOpen] = useState(false);
  
const [modalType, setModalType] = useState<ModalType|null>();
const [modalSectionCompany, setModalSectionCompany] = 
useState<ModalSectionCompany|null >();

const [modalSectionContact, setModalSectionContact] = 
useState<ModalSectionContact|null>();

const [companies, setCompanies] = useState<Company[]>([]);
const [companicontactses, setContacts] = useState<Contact[]>([]);
const openEditContact = (section: ModalSectionContact) => {
  setModalType('editContact');
  setModalSectionContact(section);
  // При открытии формы будем в полях модалки читать из resumeData[section === 'company' ? 'contactCompany' : 'contactParentCompany']
  setModalOpen(true);
  console.log(modalOpen , modalType, modalSectionCompany, modalSectionContact)
};

const closeModal =() =>{
  setModalType(null);
  setModalSectionContact(null);
  setModalOpen(false);
}
// 2. Открывает модалку выбора контакта из существующих
const handleSaveContact = (updated: Contact) => {
  setResumeData(rd => rd ? ({ ...rd, [modalSectionContact==="contactCompany"?"contactCompany":"contactCompamyParent"]: updated }) : rd);
};
const openSelectContact = async (section: ModalSectionContact) => {
  setModalType('selectContact');
  setModalSectionContact(section);

  // Получаем ID связанной компании
  const compId = resumeData?.[section === 'contactCompany' ? 'company' : 'parentCompany']?.companyId;
  if (!compId) {
    alert('Zuerst Firma auswählen!');
    return;
  }

  // Загружаем список всех контактов этой компании
  //loginId: number, companyId: number
  const list = await getContacts( storedUser.loginid, compId );
  setContacts(list);

  setModalOpen(true);
};

const handleRemoveContact = (section: ModalSectionContact) => {
  const key = section === 'contactCompany' ? 'contactCompany' : 'contactParentCompany';
  const contact =resumeData&& resumeData[key];
  if (!contact?.contactid) return;

  if (!window.confirm('Kontakt wirklich löschen?')) return;

  // Можно вызвать API deleteContact(contact.contactId), но если не нужно — просто отвязываем:
  setResumeData(prev => prev
    ? ({
        ...prev,
        [key]: null
      })
    : prev
  );
};
// Handlers:
const handleOpenEdit = (section: 'company'|'parentCompany') => {
  setModalType('edit');
  setModalSectionCompany(section);
  setModalOpen(true);
};
const handleOpenSelect = async (section: 'company'|'parentCompany') => {
//  const list = await getCompanies({ isrecruter: false });
const list = await getCompanies(storedUser.loginid, section==='parentCompany');
  setCompanies(list);
  setModalType('select');
  setModalSectionCompany(section);
  setModalOpen(true);
};
const handleSaveCompany = (comp: Company) => {
  if(!modalSectionCompany) return;
   comp.isRecruter =modalSectionCompany==='parentCompany'
   comp.companyId=comp.companyId||0;
  setResumeData(rd => rd ? { ...rd, [modalSectionCompany]: comp } : rd);
  setModalOpen(false);
};

const handleRemoveCompany = (section: 'company' | 'parentCompany') => {
  setResumeData(rd => rd ? { ...rd, [section]: null } : rd);
};
const handleSelectCompany = (comp: Company) => {
  if (!modalSectionCompany) return;
  setResumeData(rd => rd ? { ...rd, [modalSectionCompany]: comp } : rd);
  setModalOpen(false);
};

  useEffect(() => {
    getStates()
      .then(setStatusList)
      .catch((err) => console.error('Fehler beim Laden der Status-Werte:', err));

    if (resumeId && resumeId !== '0') {
      getResumeById(Number(resumeId))
        .then((data) => setResumeData(data))
        .catch((err) => console.error('Fehler beim Laden des Resumes:', err));
    } else {
      setResumeData({
        resumeId: 0,
        ref: storedUser.loginid,
        position: '',
        stateId: 0,
        stateText: '',
        link: '',
        comment: '',
        created: new Date().toISOString().split('T')[0],
        company: null,
        parentCompany: null,
        contactCompany: null,
        contactParentCompany: null,
      });
    }
  }, [resumeId]);

  const handleSave = async () => {
    if (!resumeData) return;

    if (!resumeData.position ) {
      setErrorMessage('Position und Status sind Pflichtfelder!');
      return;
    }

    try {
      await updateOrCreateResume(resumeData);
      alert(
        resumeData.resumeId === 0
          ? '✅ Neue Bewerbung erfolgreich gespeichert!'
          : '✅ Bewerbung erfolgreich aktualisiert!'
      );
      navigate('/resumes');
    } catch (error) {
      console.error('Fehler beim Speichern/Aktualisieren:', error);
      setErrorMessage('Fehler beim Speichern der Bewerbung. Bitte später versuchen.');
    }
  };

  const handleBack = () => {
    navigate('/resumes');
  };

  if (!resumeData) {
    return <div className="text-center mt-10">Lade Daten...</div>;
  }

console.log(modalOpen , modalType, modalSectionCompany, modalSectionContact);
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {resumeData.resumeId === 0 ? 'Neue Bewerbung erstellen' : 'Bewerbung bearbeiten'}
      </h2>

   
      <div className="mb-4">
        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
          Position
        </label>
        <input
          type="text"
          id="position"
          className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          value={resumeData.position}
          onChange={(e) => setResumeData({ ...resumeData, position: e.target.value })}
          placeholder="Position eingeben"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          value={resumeData.stateId}
          onChange={(e) => setResumeData({ ...resumeData, stateId: Number(e.target.value) })}
        >
          <option value="">Status auswählen</option>
          {statusList.map((s) => (
            <option key={s.stateid} value={s.stateid}>
              {s.text}
            </option>
          ))}
        </select>
      </div>

   
      <div className="mb-4">
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
          Bewerbungslink
        </label>
        <input
          type="url"
          id="link"
          className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          value={resumeData.link}
          onChange={(e) => setResumeData({ ...resumeData, link: e.target.value })}
          placeholder="Link eingeben"
        />
      </div>

   
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Kommentar
        </label>
        <textarea
          id="comment"
          rows={3}
          className="form-textarea w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          value={resumeData.comment}
          onChange={(e) => setResumeData({ ...resumeData, comment: e.target.value })}
          placeholder="Kommentar hinzufügen"
        />
      </div>

    
      <div className="mb-4">
        <label htmlFor="created" className="block text-sm font-medium text-gray-700 mb-1">
          Erstellt am
        </label>
        <input
          type="text"
          id="created"
          className="form-input w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed"
          value={resumeData.created}
          readOnly
        />
      </div>


     <CompanySection
  title="Recruter"
  name={resumeData.parentCompany?.name || null}
  onEdit={() => handleOpenEdit('parentCompany')}
  onSelect={() => handleOpenSelect('parentCompany')}
  onRemove={() => handleRemoveCompany('parentCompany')}
  onCreate={() => handleOpenEdit('parentCompany')}
/>


      <ContactSection
  title="Kontaktperson Recruter"
  name={resumeData.contactParentCompany?.name || null}
  contactId={resumeData.contactParentCompany?.contactid}
  companyId={resumeData.parentCompany?.companyId}
  onEdit={() => openEditContact('contactParentCompany')}
  onSelect={() => openSelectContact('contactParentCompany')}
  onRemove={() => handleRemoveContact('contactParentCompany')}
  onCreate={() => openEditContact('contactParentCompany')}
/>

  

      <CompanySection
  title="Firma"
  name={resumeData.company?.name || null}
  onEdit={() => handleOpenEdit('company')}
  onSelect={() => handleOpenSelect('company')}
  onRemove={() => handleRemoveCompany('company')}
  onCreate={() => handleOpenEdit('company')}
/>


      <ContactSection
  title="Kontaktperson"
  name={resumeData.contactCompany?.name || null}
  contactId={resumeData.contactCompany?.contactid}
  companyId={resumeData.company?.companyId}
  onEdit={() => openEditContact('contactCompany')}
  onSelect={() => openSelectContact('contactCompany')}
  onRemove={() => handleRemoveContact('contactCompany')}
  onCreate={() => openEditContact('contactCompany')}
/>

 
<CompanyFormModal
  isOpen={modalOpen && modalType === 'edit'}
  onClose={() => setModalOpen(false)}
  initialData={modalSectionCompany&&resumeData[modalSectionCompany] || {
    companyId: 0,
    name: '',
    city: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    isRecruter: false,
    ref: storedUser.loginid,
  }}
  onSave={handleSaveCompany}
/>
<CompanySelectModal
  isOpen={modalOpen && modalType === 'select'}
  onClose={() => setModalOpen(false)}
  companies={companies}
  onSelect={handleSelectCompany}
/>


<ContactFormModal
      contact={resumeData[modalSectionCompany === 'company' ? 'contactCompany' : 'contactParentCompany'] || {
        contactid: 0,
        vorname: '',
        name: '',
        email: '',
        anrede: 0,
        title: '',
        zusatzname: '',
        phone: '',
        mobile: '',
        company: resumeData[modalSectionCompany === 'company' ? 'company' : 'parentCompany']?.companyId || 0,
        ref: resumeData.ref,
      }}
      onSave={(updated: Contact) => handleSaveContact(updated)}
      isOpen={modalOpen && modalType === 'editContact'}
  onClose={() => setModalOpen(false)}
    />

 
   <ContactFormModal
      contact={resumeData[modalSectionCompany === 'company' ? 'contactCompany' : 'contactParentCompany'] || {
        contactid: 0,
        vorname: '',
        name: '',
        email: '',
        anrede: 0,
        title: '',
        zusatzname: '',
        phone: '',
        mobile: '',
        company: resumeData[modalSectionCompany === 'company' ? 'company' : 'parentCompany']?.companyId || 0,
        ref: resumeData.ref,
      }}
      // Removed onChange as it is not a valid prop
      onSave={(updated: Contact) => handleSaveContact(updated)}
      isOpen={modalOpen && modalType === 'editContact'}
  onClose={() => setModalOpen(false)}
    />
    
      {errorMessage && (
        <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>
      )}

   
      <div className="flex justify-between mt-6">
        <button
          className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          onClick={handleSave}
        >
          Speichern
        </button>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          onClick={handleBack}
        >
          Zurück zur Liste
        </button>
      </div>
    </div>
  );
};

export default ResumeEdit;
