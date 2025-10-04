import React from 'react';
import { useTranslation } from 'react-i18next';
import { Contact } from '../../../../interfaces/Contact';

type Props = {
  title: string;
  contact: Contact | null;
  companyId?: number;
  onEdit: () => void;
  onSelect: () => void;
  onCreate: () => void;
  onRemove: () => void;
};

export default function ContactSection({
  title,
  contact,
  companyId,
  onEdit,
  onSelect,
  onCreate,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const hasContact = !!contact?.contactid;
  const hasCompany = companyId !== undefined;

  return (
    <section className="mb-6 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        <div className="flex flex-wrap gap-2">
          {hasCompany && (
            <>
              <button
                type="button"
                className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                onClick={onSelect}
              >
                {t('resumeEdit.selectContact')}
              </button>

              <button
                type="button"
                className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                onClick={onCreate}
              >
                {t('resumeEdit.newContact')}
              </button>

              {hasContact && (
                <>
                  <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                    onClick={onEdit}
                  >
                    {t('common.edit')}
                  </button>

                  <button
                    type="button"
                    className="rounded-md bg-gray-500 px-3 py-1 text-white hover:bg-gray-700"
                    onClick={onRemove}
                  >
                    {t('common.remove')}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-700">
        {hasContact ? (
          <div>
            <div className="font-medium">
              {[contact?.vorname, contact?.name].filter(Boolean).join(' ') ||
                t('resumeEdit.contactWithoutName')}
            </div>
            {contact?.email ? <div className="text-gray-500">{contact.email}</div> : null}
          </div>
        ) : (
          <span className="text-gray-400">
            {hasCompany ? t('resumeEdit.noContactSelected') : t('resumeEdit.selectCompanyFirst')}
          </span>
        )}
      </div>
    </section>
  );
}
