// src/components/resume/ResumeEditForm.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Resume, Contact } from '../../../../interfaces';
import { FormField, inputClasses } from '../ui/FormField';

import ContactSection from '../contact/ContactSection';
import PageHeader from '../ui/PageHeader';
import { PageId } from '../ui/PageId';
import { CompanySection } from '../company';

type StatusItem = { stateid: number; text: string };

type ModalSectionCompany = 'company' | 'recrutingCompany';
type ModalSectionContact = 'contactCompany' | 'contactRecrutingCompany';

type Props = {
  // Daten
  resume: Resume; // Form wird nur gerendert, wenn resume vorhanden ist
  statusList: StatusItem[];
  errorMessage?: string | null;

  // Mutationen
  setResume: React.Dispatch<React.SetStateAction<Resume | null>>;

  // Company-Aktionen (öffnen/auswählen/entfernen – Modals rendert der Container)
  onOpenEditCompany: (section: ModalSectionCompany) => void;
  onOpenSelectCompany: (section: ModalSectionCompany) => void;
  onRemoveCompany: (section: ModalSectionCompany) => void;

  // Contact-Aktionen
  onOpenEditContact: (section: ModalSectionContact) => void;
  onOpenSelectContact: (section: ModalSectionContact) => void;
  onRemoveContact: (section: ModalSectionContact) => void;

  // Form-Aktionen
  onSave: () => void;
  onBack: () => void;
  onView: () => void;
  onOpenHistory?: () => void;
};

export default function ResumeEditForm({
  resume,
  statusList,
  errorMessage,
  setResume,
  onOpenEditCompany,
  onOpenSelectCompany,
  onRemoveCompany,
  onOpenEditContact,
  onOpenSelectContact,
  onRemoveContact,
  onSave,
  onBack,
  onView,
  onOpenHistory,
}: Props) {
  const { t } = useTranslation();

  const update = (patch: Partial<Resume>) =>
    setResume((prev) => (prev ? { ...prev, ...patch } : prev));

  const title = resume.resumeId === 0 ? t('resumeEdit.createTitle') : t('resumeEdit.editTitle');

  const recrutingCompanyId = resume.recrutingCompany?.companyId;
  const companyId = resume.company?.companyId;

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-md">
      <PageHeader pageTitle={title} pageId={PageId.ResumeEdit} />

      <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-md">
        {/* Position */}
        <FormField label={t('resumeEdit.position')} htmlFor="position">
          <input
            type="text"
            id="position"
            className={inputClasses}
            value={resume.position}
            onChange={(e) => update({ position: e.target.value })}
            placeholder={t('resumeEdit.positionPlaceholder')}
          />
        </FormField>

        {/* Status */}
        <FormField label={t('common.status')} htmlFor="status">
          <select
            id="status"
            className={inputClasses}
            value={resume.stateId}
            onChange={(e) => update({ stateId: Number(e.target.value) })}
            aria-label={t('common.status')}
          >
            <option value="">{t('resumeEdit.statusSelect')}</option>
            {statusList.map((s) => (
              <option key={s.stateid} value={s.stateid}>
                {t(s.text)}
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
            value={resume.link}
            onChange={(e) => update({ link: e.target.value })}
            placeholder={t('resumeEdit.linkPlaceholder')}
          />
        </FormField>

        {/* Kommentar */}
        <FormField label={t('resumeEdit.comment')} htmlFor="comment">
          <textarea
            id="comment"
            rows={3}
            className={inputClasses}
            value={resume.comment}
            onChange={(e) => update({ comment: e.target.value })}
            placeholder={t('resumeEdit.commentPlaceholder')}
          />
        </FormField>

        {/* Erstellt am */}
        <FormField label={t('resumeEdit.created')} htmlFor="created">
          <input
            type="text"
            id="created"
            className={`${inputClasses} cursor-not-allowed bg-gray-100`}
            value={resume.created}
            readOnly
            title={t('resumeEdit.created')}
          />
        </FormField>

        {/* Recruiter-Firma */}
        <CompanySection
          title={t('resumeEdit.recruiter')}
          name={resume.recrutingCompany?.name || null}
          onEdit={() => onOpenEditCompany('recrutingCompany')}
          onSelect={() => onOpenSelectCompany('recrutingCompany')}
          onRemove={() => onRemoveCompany('recrutingCompany')}
          onCreate={() => onOpenEditCompany('recrutingCompany')}
        />

        {/* Recruiter-Kontakt */}
        <ContactSection
          title={t('resumeEdit.recruiterContact')}
          contact={resume.contactRecrutingCompany as Contact | null}
          companyId={recrutingCompanyId}
          onEdit={() => onOpenEditContact('contactRecrutingCompany')}
          onSelect={() => onOpenSelectContact('contactRecrutingCompany')}
          onRemove={() => onRemoveContact('contactRecrutingCompany')}
          onCreate={() => onOpenEditContact('contactRecrutingCompany')}
        />

        {/* Unternehmen */}
        <CompanySection
          title={t('resumeEdit.company')}
          name={resume.company?.name || null}
          onEdit={() => onOpenEditCompany('company')}
          onSelect={() => onOpenSelectCompany('company')}
          onRemove={() => onRemoveCompany('company')}
          onCreate={() => onOpenEditCompany('company')}
        />

        {/* Unternehmens-Kontakt */}
        <ContactSection
          title={t('resumeEdit.companyContact')}
          contact={resume.contactCompany as Contact | null}
          companyId={companyId}
          onEdit={() => onOpenEditContact('contactCompany')}
          onSelect={() => onOpenSelectContact('contactCompany')}
          onRemove={() => onRemoveContact('contactCompany')}
          onCreate={() => onOpenEditContact('contactCompany')}
        />

        {errorMessage && <div className="mb-4 font-medium text-red-600">{errorMessage}</div>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-700"
            onClick={onSave}
          >
            {t('common.save')}
          </button>

          <button
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
            onClick={onBack}
          >
            {t('resumeEdit.backToList')}
          </button>

          {process.env.NODE_ENV !== 'production' && <button
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
            onClick={onView}
          >
            {t('common.view')}
          </button>}

          {resume.resumeId > 0 && onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="rounded-md bg-gray-600 px-3 py-1 text-white hover:bg-gray-800"
            >
              {t('resumeEdit.history')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
