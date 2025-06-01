import React, { useState, useEffect } from 'react';
import { getAnrede } from '../../services/api';
import { Anrede, Contact } from '../../../../interfaces/Contact';
import { useTranslation } from 'react-i18next';
import { FormField, inputClasses } from '../ui/FormField';



interface ContactFormModalProps {
  isOpen: boolean;
  contact: Contact;
  onSave: (contact: Contact) => void;
  onClose: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, contact, onSave, onClose }) => {
  const { t } = useTranslation();
  const [contactData, setContactData] = useState<Contact>(contact);
  const [anreden, setAnreden] = useState<Anrede[]>([]);

  useEffect(() => {
    const fetchAnreden = async () => {
      try {
        const result = await getAnrede();
        setAnreden(result);
      } catch (error) {
        console.error(t('common.error'), error);
      }
    };
    fetchAnreden();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setContactData(contact);
    }
  }, [isOpen, contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setContactData(contact);
    onClose();
  };

  const handleSave = () => {
    onSave(contactData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <h2 className="text-xl font-semibold mb-4">{t('contact.edit')}</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormField label={t('contact.anrede')} htmlFor="anrede">
                <select
                  id="anrede"
                  name="anrede"
                  value={contactData.anrede ?? '0'}
                  onChange={(e) =>
                    setContactData(prev => ({ ...prev, anrede: e.target.value ? Number(e.target.value) : 0 }))
                  }
                  className={inputClasses}
                  title={t('contact.anrede')}
                >
                  {anreden.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.text || t('common.select')}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label={t('contact.title')} htmlFor="title">
                <input
                  id="title"
                  placeholder={t('contact.titlePlaceholder')}
                  type="text"
                  name="title"
                  value={contactData.title}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </FormField>

              <FormField label={t('common.name')} htmlFor="name">
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={contactData.name}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder={t('contact.namePlaceholder')}
                  required
                />
              </FormField>
            </div>
            <div>
              <FormField label={t('contact.email')} htmlFor="email">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={contactData.email}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </FormField>

              <FormField label={t('contact.phone')} htmlFor="phone">
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={contactData.phone}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder={t('contact.phonePlaceholder')}
                />
              </FormField>

              <FormField label={t('contact.mobile')} htmlFor="mobile">
                <input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  value={contactData.mobile}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder={t('contact.mobilePlaceholder')}
                />
              </FormField>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg mr-2" onClick={handleClose}>
              {t('common.cancel')}
            </button>
            <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={handleSave}>
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;