import React from 'react';
import { User } from '../../../../interfaces';

export interface AnredeOption {
  id: number;
  text: string;
}

// Gemeinsame Props für alle Formularfelder (für die Wiederverwendbarkeit)
interface FormFieldProps {
  label: React.ReactNode; // vorher: string
  htmlFor: string;
  children: React.ReactNode;
}
export interface ProfileFormProps {
  formData: User;
  anredeOptions: AnredeOption[];
  onChange: (field: keyof User, value: string | number) => void;
}
export const inputClasses =
  'mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition duration-200 ease-in-out text-gray-800 placeholder-gray-400';
export const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, children }) => {
  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      {children}
    </div>
  );
};
