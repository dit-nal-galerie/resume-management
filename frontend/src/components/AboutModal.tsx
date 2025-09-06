import React from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  // Hilfsfunktion für Array-Übersetzungen
  const getArray = (key: string) => {
    const arr = t(key, { returnObjects: true });

    return Array.isArray(arr) ? (arr as string[]) : [];
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
          <Dialog.Title className="mb-4 text-2xl font-bold">{t('about.title')}</Dialog.Title>

          <p className="mb-4 text-gray-700">{t('about.intro')}</p>

          <h3 className="mb-2 mt-6 text-lg font-semibold">{t('about.features_title')}</h3>
          <ul className="list-inside list-disc text-gray-700">
            {getArray('about.features').map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="mb-2 mt-6 text-lg font-semibold">{t('about.tech_title')}</h3>
          <ul className="list-inside list-disc text-gray-700">
            {getArray('about.technologies').map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="mb-2 mt-6 text-lg font-semibold">{t('about.ai_title')}</h3>
          <p className="text-gray-700">{t('about.ai_text')}</p>

          <h3 className="mb-2 mt-6 text-lg font-semibold">{t('about.target_title')}</h3>
          <p className="text-gray-700">{t('about.target_intro')}</p>
          <ul className="list-inside list-disc text-gray-700">
            {getArray('about.targets').map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <div className="mt-6 text-right">
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
              onClick={onClose}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
