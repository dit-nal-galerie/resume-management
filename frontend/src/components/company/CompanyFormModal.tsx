import React, { useState, useEffect } from 'react';
import { Company } from '../../../../interfaces/Company';
import { FormField, inputClasses } from '../ui/FormField';
import { useTranslation } from 'react-i18next';

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Company;
  onSave: (data: Company) => void;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<Company>(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (field: keyof Company, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">
          {initialData.companyId
            ? t('company.form.title') + ' ' + t('common.edit')
            : t('company.select.new')}
        </h2>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('common.name')} htmlFor="company-name">
              <input
                id="company-name"
                type="text"
                className={inputClasses}
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('common.name')}
              />
            </FormField>

            <FormField label={t('company.form.city')} htmlFor="company-city">
              <input
                id="company-city"
                type="text"
                className={inputClasses}
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder={t('company.form.city')}
              />
            </FormField>

            <FormField label={t('company.form.street')} htmlFor="company-street">
              <input
                id="company-street"
                type="text"
                className={inputClasses}
                value={form.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder={t('company.form.street')}
              />
            </FormField>

            <FormField label={t('company.form.houseNumber')} htmlFor="company-houseNumber">
              <input
                id="company-houseNumber"
                type="text"
                className={inputClasses}
                value={form.houseNumber}
                onChange={(e) => handleChange('houseNumber', e.target.value)}
                placeholder={t('company.form.houseNumber')}
              />
            </FormField>

            <div className="col-span-2">
              <FormField label={t('company.form.postalCode')} htmlFor="company-postalCode">
                <input
                  id="company-postalCode"
                  type="text"
                  className={inputClasses}
                  value={form.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder={t('company.form.postalCode')}
                />
              </FormField>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700"
              onClick={onClose}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={() => onSave(form)}
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyFormModal;
