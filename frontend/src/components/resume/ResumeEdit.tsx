import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Resume } from '../../../../interfaces/Resume';
import { User } from '../../../../interfaces/User';
import { getCompanies, getContacts, getResumeById, getStates, updateOrCreateResume } from '../../services/api';
import { loadUserFromStorage } from '../../utils/storage';

import { Company } from '../../../../interfaces/Company';

import ContactSection from '../contact/ContactSection';
import { Contact } from '../../../../interfaces/Contact';
import ContactFormModal from '../contact/ContactFormModal';
import { ModalSectionCompany, ModalSectionContact, ModalType } from './ResumeEditModals.types';
import { HistoryModal } from './HistoryModal';
import { useTranslation } from 'react-i18next';
import { FormField, inputClasses } from '../ui/FormField';
import { CompanyFormModal, CompanySection, CompanySelectModal } from 'components/company';
import PageHeader from 'components/ui/PageHeader';
import { PageId } from 'components/ui/PageId';



const ResumeEdit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resumeId } = useParams<{ resumeId: string }>();
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [statusList, setStatusList] = useState<{ stateid: number; text: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storedUser: User = loadUserFromStorage();
  const [modalOpen, setModalOpen] = useState(false);

  const [modalType, setModalType] = useState<ModalType | null>();
  const [modalSectionCompany, setModalSectionCompany] = useState<ModalSectionCompany | null>();
  const [modalSectionContact, setModalSectionContact] = useState<ModalSectionContact | null>();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companicontactses, setContacts] = useState<Contact[]>([]);
  const openEditContact = (section: ModalSectionContact) => {
    setModalType('editContact');
    setModalSectionContact(section);
    setModalOpen(true);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setModalType(null);
    setModalSectionContact(null);
    setModalOpen(false);
  };
  const handleSaveContact = (updated: Contact) => {
    if (updated) {
      updated.ref = storedUser.loginid;
      updated.anrede = updated.anrede || 0;
      const tKey = modalSectionContact === "contactCompany" ? "company" : "recrutingCompany";
      updated.company = resumeData?.[tKey]?.companyId || 0;
    }
    setResumeData(rd => rd ? ({ ...rd, [modalSectionContact === "contactCompany" ? "contactCompany" : "contactRecrutingCompany"]: updated }) : rd);
  };
  const openSelectContact = async (section: ModalSectionContact) => {
    setModalType('selectContact');
    setModalSectionContact(section);
    const compId = resumeData?.[section === 'contactCompany' ? 'company' : 'recrutingCompany']?.companyId;
    if (!compId) {
      alert(t('resumeEdit.selectCompanyFirst'));
      return;
    }
    const list = await getContacts(storedUser.loginid, compId);
    setContacts(list);
    setModalOpen(true);
  };
  const handleRemoveContact = (section: ModalSectionContact) => {
    const key = section === "contactCompany" ? 'contactCompany' : 'contactRecrutingCompany';
    const contact = resumeData && resumeData[key];
    if (!contact?.contactid) return;
    if (!window.confirm(t('resumeEdit.confirmDeleteContact'))) return;
    setResumeData(prev => prev ? ({ ...prev, [key]: null }) : prev);
  };
  const handleOpenEdit = (section: ModalSectionCompany) => {
    setModalType('edit');
    setModalSectionCompany(section);
    setModalOpen(true);
  };
  const handleOpenSelect = async (section: 'company' | 'recrutingCompany') => {
    const list = await getCompanies(storedUser.loginid, section === 'recrutingCompany');
    setCompanies(list);
    setModalType('select');
    setModalSectionCompany(section);
    setModalOpen(true);
  };
  const handleSaveCompany = (comp: Company) => {
    if (!modalSectionCompany) return;
    comp.isRecruter = modalSectionCompany === 'recrutingCompany';
    comp.companyId = comp.companyId || 0;
    setResumeData(rd => rd ? { ...rd, [modalSectionCompany]: comp } : rd);
    setModalOpen(false);
  };
  const handleRemoveCompany = (section: ModalSectionCompany) => {
    setResumeData(rd => rd ? { ...rd, [section]: null } : rd);
  };
  const handleSelectCompany = (comp: Company) => {
    if (!modalSectionCompany) return;
    setResumeData(rd => rd ? { ...rd, [modalSectionCompany]: comp } : rd);
    setModalOpen(false);
  };

  const closeHistoryModal = () => setIsModalOpen(false);
  const openHistoryModal = () => setIsModalOpen(true);

  useEffect(() => {
    getStates()
      .then(setStatusList)
      .catch(() => { });

    if (resumeId && resumeId !== '0') {
      getResumeById(Number(resumeId))
        .then((data) => setResumeData(data))
        .catch(() => { });
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
        recrutingCompany: null,
        contactCompany: null,
        contactRecrutingCompany: null,
      });
    }
  }, [resumeId]);

  const handleSave = async () => {
    if (!resumeData) return;
    if (!resumeData.position) {
      setErrorMessage(t('resumeEdit.requiredFields'));
      return;
    }
    try {
      await updateOrCreateResume(resumeData);
      alert(
        resumeData.resumeId === 0
          ? t('resumeEdit.saveSuccessNew')
          : t('resumeEdit.saveSuccessUpdate')
      );
      navigate('/resumes');
    } catch (error) {
      setErrorMessage(t('resumeEdit.saveError'));
    }
  };

  const handleBack = () => {
    navigate('/resumes');
  };

  const handleView = () => {
    const tView = JSON.stringify(resumeData?.contactCompany, null, 2) +
      '\n' + JSON.stringify(resumeData?.contactRecrutingCompany, null, 2);
    alert(tView);
  };

  if (!resumeData) {
    return <div className="text-center mt-10">{t('resumeEdit.loading')}</div>;
  }
  if (errorMessage) {
    return <div className="text-red-500 text-center mt-10">{errorMessage}</div>;
  }

  const getCurrentContact = () =>
    modalSectionContact === 'contactCompany' ? resumeData?.contactCompany : resumeData?.contactRecrutingCompany;
  const getCurrentCompanyId = () =>
    modalSectionContact === 'contactCompany' ? resumeData?.company?.companyId : resumeData?.recrutingCompany?.companyId;
  const title = resumeData.resumeId === 0 ? t('resumeEdit.createTitle') : t('resumeEdit.editTitle');
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <PageHeader pageTitle={title} pageId={PageId.ResumeEdit} />
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {resumeData.resumeId === 0 ? t('resumeEdit.createTitle') : t('resumeEdit.editTitle')}
      </h2> */}

        {/* Position */}
        <FormField label={t('resumeEdit.position')} htmlFor="position">
          <input
            type="text"
            id="position"
            className={inputClasses}
            value={resumeData.position}
            onChange={(e) => setResumeData({ ...resumeData, position: e.target.value })}
            placeholder={t('resumeEdit.positionPlaceholder')}
          />
        </FormField>

        {/* Status */}
        <FormField label={t('common.status')} htmlFor="status">
          <select
            id="status"
            className={inputClasses}
            value={resumeData.stateId}
            onChange={(e) => setResumeData({ ...resumeData, stateId: Number(e.target.value) })}
            aria-label={t('common.status')}
          >
            <option value="">{t('resumeEdit.statusSelect')}</option>
            {statusList.map((s) => (
              <option key={s.stateid} value={s.stateid}>
                {s.text}
              </option>
            ))}
          </select>
        </FormField>

        {/* Link */}
        <FormField label={t('resumeEdit.link')} htmlFor="link">
          <input
            type="url"
            id="link"
            className={inputClasses}
            value={resumeData.link}
            onChange={(e) => setResumeData({ ...resumeData, link: e.target.value })}
            placeholder={t('resumeEdit.linkPlaceholder')}
          />
        </FormField>

        {/* Kommentar */}
        <FormField label={t('resumeEdit.comment')} htmlFor="comment">
          <textarea
            id="comment"
            rows={3}
            className={inputClasses}
            value={resumeData.comment}
            onChange={(e) => setResumeData({ ...resumeData, comment: e.target.value })}
            placeholder={t('resumeEdit.commentPlaceholder')}
          />
        </FormField>

        {/* Erstellt am */}
        <FormField label={t('resumeEdit.created')} htmlFor="created">
          <input
            type="text"
            id="created"
            className={`${inputClasses} bg-gray-100 cursor-not-allowed`}
            value={resumeData.created}
            readOnly
          />
        </FormField>

        <CompanySection
          title={t('resumeEdit.recruiter')}
          name={resumeData.recrutingCompany?.name || null}
          onEdit={() => handleOpenEdit('recrutingCompany')}
          onSelect={() => handleOpenSelect('recrutingCompany')}
          onRemove={() => handleRemoveCompany('recrutingCompany')}
          onCreate={() => handleOpenEdit('recrutingCompany')}
        />

        <ContactSection
          title={t('resumeEdit.recruiterContact')}
          contact={resumeData.contactRecrutingCompany}
          companyId={resumeData.recrutingCompany?.companyId}
          onEdit={() => openEditContact('contactRecrutingCompany')}
          onSelect={() => openSelectContact('contactRecrutingCompany')}
          onRemove={() => handleRemoveContact('contactRecrutingCompany')}
          onCreate={() => openEditContact('contactRecrutingCompany')}
        />

        <CompanySection
          title={t('resumeEdit.company')}
          name={resumeData.company?.name || null}
          onEdit={() => handleOpenEdit('company')}
          onSelect={() => handleOpenSelect('company')}
          onRemove={() => handleRemoveCompany('company')}
          onCreate={() => handleOpenEdit('company')}
        />

        <ContactSection
          title={t('resumeEdit.companyContact')}
          contact={resumeData.contactCompany}
          companyId={resumeData.company?.companyId}
          onEdit={() => openEditContact('contactCompany')}
          onSelect={() => openSelectContact('contactCompany')}
          onRemove={() => handleRemoveContact('contactCompany')}
          onCreate={() => openEditContact('contactCompany')}
        />

        <CompanyFormModal
          isOpen={modalOpen && modalType === 'edit'}
          onClose={() => setModalOpen(false)}
          initialData={modalSectionCompany && resumeData[modalSectionCompany] || {
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
          contact={getCurrentContact() || {
            contactid: 0,
            vorname: '',
            name: '',
            email: '',
            anrede: 0,
            title: '',
            zusatzname: '',
            phone: '',
            mobile: '',
            company: getCurrentCompanyId() || 0,
            ref: resumeData.ref,
          }}
          onSave={handleSaveContact}
          isOpen={modalOpen && modalType === 'editContact'}
          onClose={() => setModalOpen(false)}
        />
        {isModalOpen && resumeData && (
          <HistoryModal
            isOpen={isModalOpen}
            onClose={closeHistoryModal}
            resumeId={resumeData.resumeId}
            refId={storedUser.loginid}
            resumeTitle={resumeData?.position || ""}
            currentStateId={-1}
          />
        )}

        {errorMessage && (
          <div className="mb-4 text-red-600 font-medium">{errorMessage}</div>
        )}

        <div className="flex justify-between mt-6">
          <button
            className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            onClick={handleSave}
          >
            {t('common.save')}
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            onClick={handleBack}
          >
            {t('resumeEdit.backToList')}
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            onClick={handleView}
          >
            {t('common.view')}
          </button>
          {resumeData && resumeData.resumeId > 0 && (
            <button
              onClick={() => openHistoryModal()}
              className="bg-gray-600 hover:bg-gray-800 text-white px-3 py-1 rounded-md"
            >
              {t('resumeEdit.history')}
            </button>
          )}
        </div>
      </div>
    </div>

  );
};

export default ResumeEdit;