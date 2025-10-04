import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormField, inputClasses, ProfileFormProps } from '../ui/FormField';

// Schnittstelle für die Anrede-Optionen

const ProfileForm: React.FC<ProfileFormProps> = ({ errors, formData, anredeOptions, onChange }) => {
  const { t } = useTranslation();

  // Gemeinsame Tailwind-Klassen für Input- und Select-Felder
  // Verbesserter Fokus-Ring und Hover-Effekt für bessere Interaktion

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
      {/* <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {t('profile.title')}
      </h2> */}

      <div className="space-y-6">
        {/* Einheitlicher vertikaler Abstand zwischen den Hauptfeldern */}
        <FormField errors={errors} label={t('contact.anrede')} htmlFor="anrede">
          <select
            id="anrede"
            value={formData.anrede}
            onChange={(e) => onChange('anrede', Number(e.target.value))}
            className={inputClasses}
            title={t('contact.anrede')}
          >
            <option value="">{t('common.required')}</option>
            {anredeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {t(option.text)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField errors={errors} label={t('common.name')} htmlFor="name">
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={inputClasses}
            placeholder={t('common.name')}
          />
        </FormField>
        <FormField errors={errors} label={t('profile.email')} htmlFor="email">
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.email')}
          />
        </FormField>
        <FormField errors={errors} label={t('profile.city')} htmlFor="city">
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.city')}
          />
        </FormField>
        {/* Gruppe für Straße und Hausnummer mit responsivem Gitter */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField errors={errors} label={t('profile.street')} htmlFor="street">
            <input
              type="text"
              id="street"
              value={formData.street}
              onChange={(e) => onChange('street', e.target.value)}
              className={inputClasses}
              placeholder={t('profile.street')}
            />
          </FormField>

          <FormField errors={errors} label={t('profile.houseNumber')} htmlFor="houseNumber">
            <input
              type="text"
              id="houseNumber"
              value={formData.houseNumber}
              onChange={(e) => onChange('houseNumber', e.target.value)}
              className={inputClasses}
              placeholder={t('profile.houseNumber')}
            />
          </FormField>
        </div>
        <FormField errors={errors} label={t('profile.postalCode')} htmlFor="postalCode">
          <input
            type="text"
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.postalCode')}
          />
        </FormField>
        <FormField errors={errors} label={t('profile.phone')} htmlFor="phone">
          <input
            type="text"
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.phone')}
          />
        </FormField>
        <FormField errors={errors} label={t('profile.mobile')} htmlFor="mobile">
          <input
            type="text"
            id="mobile"
            value={formData.mobile}
            onChange={(e) => onChange('mobile', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.mobile')}
          />
        </FormField>
      </div>
    </div>
  );
};

export default ProfileForm;
