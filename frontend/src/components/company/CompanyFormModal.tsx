import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Company } from '../../../../interfaces/Company';

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
  const [form, setForm] = useState<Company>(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (field: keyof Company, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <h2 className="text-xl font-semibold mb-4">
          {initialData.companyId ? 'Firma bearbeiten' : 'Neue Firma'}
        </h2>

        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Firmenname</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm">Stadt</label>
              <input
              placeholder='Stsadt'
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm">Straße</label>
              <input
              placeholder='Straße'
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.street}
                onChange={e => handleChange('street', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm">Hausnummer</label>
              <input
              placeholder='Hausnummer'
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.houseNumber}
                onChange={e => handleChange('houseNumber', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm">Postleitzahl</label>
              <input
              placeholder='Postleitzahl'
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={form.postalCode}
                onChange={e => handleChange('postalCode', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg"
              onClick={onClose}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => onSave(form)}
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyFormModal;
