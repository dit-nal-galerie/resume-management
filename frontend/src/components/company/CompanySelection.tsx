import React from 'react';
import { useTranslation } from 'react-i18next';

interface CompanySectionProps {
  title: string;
  name: string | null;
  companyId?: number;
  onEdit: () => void;
  onSelect: () => void;
  onRemove?: () => void;
  onCreate: () => void;
}

const CompanySection: React.FC<CompanySectionProps> = ({
  title,
  name,
  onEdit,
  onSelect,
  onRemove,
  onCreate,
}) => {
  const { t } = useTranslation();
  const exists = name !== null;

  return (
    <div className="mb-4 rounded-lg bg-gray-200 p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-700">{name || t('company.notSpecified')}</p>
      <div className="mt-2 flex space-x-2">
        {exists ? (
          <button
            className="rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-700"
            onClick={onEdit}
          >
            {t('common.edit')}
          </button>
        ) : (
          <button
            className="rounded-md bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-700"
            onClick={onCreate}
          >
            {t('company.createNew')}
          </button>
        )}

        <button
          className="rounded-md bg-green-500 px-3 py-2 text-white hover:bg-green-700"
          onClick={onSelect}
        >
          {t('company.select.select')}
        </button>

        {exists && onRemove && (
          <button
            className="rounded-md bg-red-500 px-3 py-2 text-white hover:bg-red-700"
            onClick={onRemove}
          >
            {t('common.delete')}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanySection;
