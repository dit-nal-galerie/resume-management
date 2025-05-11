import React from 'react';
import { User } from '../../../interfaces/User';

interface AnredeOption {
  id: number;
  text: string;
}

interface ProfileFormProps {
  formData: User;
  anredeOptions: AnredeOption[];
  onChange: (field: keyof User, value: string | number) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ formData, anredeOptions, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="anrede" className="block text-sm font-medium text-gray-700">
          Anrede
        </label>
        <select
          id="anrede"
          value={formData.anrede}
          onChange={(e) => onChange('anrede', Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Bitte wählen</option>
          {anredeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Name eingeben"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-Mail
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="E-Mail eingeben"
        />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
          Stadt
        </label>
        <input
          type="text"
          id="city"
          value={formData.city}
          onChange={(e) => onChange('city', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Stadt eingeben"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Straße
          </label>
          <input
            type="text"
            id="street"
            value={formData.street}
            onChange={(e) => onChange('street', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Straße eingeben"
          />
        </div>
        <div>
          <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">
            Hausnummer
          </label>
          <input
            type="text"
            id="houseNumber"
            value={formData.houseNumber}
            onChange={(e) => onChange('houseNumber', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Hausnummer eingeben"
          />
        </div>
      </div>
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
          Postleitzahl
        </label>
        <input
          type="text"
          id="postalCode"
          value={formData.postalCode}
          onChange={(e) => onChange('postalCode', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Postleitzahl eingeben"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefon
        </label>
        <input
          type="text"
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Telefonnummer eingeben"
        />
      </div>
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
          Handy
        </label>
        <input
          type="text"
          id="mobile"
          value={formData.mobile}
          onChange={(e) => onChange('mobile', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Handynummer eingeben"
        />
      </div>
    </div>
  );
};

export default ProfileForm;
