import React from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from "react-i18next";

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    // Hilfsfunktion für Array-Übersetzungen
    const getArray = (key: string) => {
        const arr = t(key, { returnObjects: true });
        return Array.isArray(arr) ? arr as string[] : [];
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />

                <div className="relative bg-white max-w-2xl w-full p-6 rounded-xl shadow-lg z-10">
                    <Dialog.Title className="text-2xl font-bold mb-4">{t('about.title')}</Dialog.Title>

                    <p className="mb-4 text-gray-700">{t('about.intro')}</p>

                    <h3 className="text-lg font-semibold mt-6 mb-2">{t('about.features_title')}</h3>
                    <ul className="list-disc list-inside text-gray-700">
                        {getArray('about.features').map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>

                    <h3 className="text-lg font-semibold mt-6 mb-2">{t('about.tech_title')}</h3>
                    <ul className="list-disc list-inside text-gray-700">
                        {getArray('about.technologies').map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>

                    <h3 className="text-lg font-semibold mt-6 mb-2">{t('about.ai_title')}</h3>
                    <p className="text-gray-700">{t('about.ai_text')}</p>

                    <h3 className="text-lg font-semibold mt-6 mb-2">{t('about.target_title')}</h3>
                    <p className="text-gray-700">{t('about.target_intro')}</p>
                    <ul className="list-disc list-inside text-gray-700">
                        {getArray('about.targets').map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>

                    <div className="text-right mt-6">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
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