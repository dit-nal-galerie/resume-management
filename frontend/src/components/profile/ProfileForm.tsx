import React from 'react';
import { User } from '../../../interfaces/User';
import { useTranslation } from 'react-i18next';
import { FormField, inputClasses, ProfileFormProps } from '../ui/FormField';

// Schnittstelle für die Anrede-Optionen

/**
 * Wiederverwendbare FormField-Komponente für konsistentes Label- und Input-Layout.
 * Verbessert die Ergonomie durch einheitliches Styling und Struktur.
 *
 * @param {FormFieldProps} props - Die Eigenschaften der Komponente.
 * @param {string} props.label - Der Text des Labels.
 * @param {string} props.htmlFor - Die ID des zugehörigen Input-Elements (für Accessibility).
 * @param {string} [props.placeholder] - Optionaler Platzhaltertext für das Input-Element.
 * @param {React.ReactNode} props.children - Das Kinderelement (Input oder Select).
 */

// Schnittstelle für die ProfileFormProps

/**
 * ProfileForm Komponente zur Anzeige und Bearbeitung von Benutzerprofildaten.
 * Verwendet Tailwind CSS für das Styling, i18next für die Internationalisierung
 * und eine wiederverwendbare FormField-Komponente für bessere Ergonomie.
 *
 * @param {ProfileFormProps} props - Die Eigenschaften der Komponente.
 * @param {User} props.formData - Die aktuellen Formulardaten des Benutzers.
 * @param {AnredeOption[]} props.anredeOptions - Optionen für das Anrede-Dropdown.
 * @param {(field: keyof User, value: string | number) => void} props.onChange - Callback-Funktion, die bei Änderungen an Formularfeldern aufgerufen wird.
 */
const ProfileForm: React.FC<ProfileFormProps> = ({ formData, anredeOptions, onChange }) => {
  const { t } = useTranslation();

  // Gemeinsame Tailwind-Klassen für Input- und Select-Felder
  // Verbesserter Fokus-Ring und Hover-Effekt für bessere Interaktion

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
      {/* <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {t('profile.title')}
      </h2> */}

      <div className="space-y-6">
        {' '}
        {/* Einheitlicher vertikaler Abstand zwischen den Hauptfeldern */}
        <FormField label={t('contact.anrede')} htmlFor="anrede">
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
        <FormField label={t('common.name')} htmlFor="name">
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={inputClasses}
            placeholder={t('common.name')}
          />
        </FormField>
        <FormField label={t('profile.email')} htmlFor="email">
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.email')}
          />
        </FormField>
        <FormField label={t('profile.city')} htmlFor="city">
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
          <FormField label={t('profile.street')} htmlFor="street">
            <input
              type="text"
              id="street"
              value={formData.street}
              onChange={(e) => onChange('street', e.target.value)}
              className={inputClasses}
              placeholder={t('profile.street')}
            />
          </FormField>

          <FormField label={t('profile.houseNumber')} htmlFor="houseNumber">
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
        <FormField label={t('profile.postalCode')} htmlFor="postalCode">
          <input
            type="text"
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.postalCode')}
          />
        </FormField>
        <FormField label={t('profile.phone')} htmlFor="phone">
          <input
            type="text"
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className={inputClasses}
            placeholder={t('profile.phone')}
          />
        </FormField>
        <FormField label={t('profile.mobile')} htmlFor="mobile">
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
