import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  name: string | null;
  onEdit: () => void;
  onSelect: () => void;
  onCreate: () => void;
  onRemove: () => void;
};

export default function CompanySection({
  title,
  name,
  onEdit,
  onSelect,
  onCreate,
  onRemove,
}: Props) {
  const { t } = useTranslation();
  const hasCompany = !!name;

  return (
    <section className="mb-6 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            onClick={onSelect}
          >
            {t('resumeEdit.selectCompany')}
          </button>

          <button
            type="button"
            className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700"
            onClick={onCreate}
          >
            {t('resumeEdit.newCompany')}
          </button>

          {hasCompany && (
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
        </div>
      </div>

      <div className="text-sm text-gray-700">
        {hasCompany ? (
          <span>{name}</span>
        ) : (
          <span className="text-gray-400">{t('resumeEdit.noCompanySelected')}</span>
        )}
      </div>
    </section>
  );
}
